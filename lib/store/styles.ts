import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Style, StylesFile } from "@/types/stylemint";
import {
  cloudGet,
  cloudSet,
  isCloudStoreEnabled,
  STORE_KEYS,
} from "@/lib/store/cloud-store";

const defaultDataDir = path.join(process.cwd(), "data");
const fallbackDataDir = path.join("/tmp", "stylemint-data");
let resolvedDataDir: string | null = null;
let stylesPath: string = path.join(defaultDataDir, "styles.json");

let cache: Style[] | null = null;
let writeLock: Promise<void> = Promise.resolve();

async function ensureStylesFile(): Promise<void> {
  const candidates = [
    process.env.STYLEMINT_DATA_DIR?.trim(),
    resolvedDataDir,
    defaultDataDir,
    fallbackDataDir,
  ].filter((dir): dir is string => Boolean(dir));

  let lastError: unknown = null;
  for (const candidate of candidates) {
    const candidatePath = path.join(candidate, "styles.json");
    try {
      await mkdir(candidate, { recursive: true });
      try {
        await readFile(candidatePath, "utf-8");
      } catch {
        const initial: StylesFile = { styles: [] };
        await writeFile(candidatePath, JSON.stringify(initial, null, 2), "utf-8");
      }
      resolvedDataDir = candidate;
      stylesPath = candidatePath;
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to initialize styles storage directory. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

async function ensureStylesStorageReady(): Promise<void> {
  if (isCloudStoreEnabled()) {
    return;
  }
  await ensureStylesFile();
}

export async function loadStyles(): Promise<Style[]> {
  if (cache) {
    return cache;
  }

  if (isCloudStoreEnabled()) {
    const remote = await cloudGet<StylesFile>(STORE_KEYS.styles);
    cache = remote?.styles ?? [];
    return cache;
  }

  await ensureStylesStorageReady();
  const raw = await readFile(stylesPath, "utf-8");
  const parsed = JSON.parse(raw) as StylesFile;
  cache = parsed.styles;
  return cache;
}

async function atomicWrite(styles: Style[]): Promise<void> {
  await ensureStylesStorageReady();
  const tempPath = `${stylesPath}.tmp`;
  await writeFile(tempPath, JSON.stringify({ styles }, null, 2), "utf-8");
  await rename(tempPath, stylesPath);
}

export async function saveStyles(styles: Style[]): Promise<void> {
  writeLock = writeLock.then(async () => {
    if (isCloudStoreEnabled()) {
      await cloudSet<StylesFile>(STORE_KEYS.styles, { styles });
    } else {
      await atomicWrite(styles);
    }
    cache = styles;
  });
  return writeLock;
}

export async function getStyleById(id: string): Promise<Style | null> {
  const styles = await loadStyles();
  return styles.find((style) => style.id === id) ?? null;
}

export interface UpdateStyleInput {
  title?: string;
  description?: string;
  pricePerGenerationSats?: number;
}

export async function updateStyleById(
  id: string,
  updates: UpdateStyleInput,
): Promise<Style | null> {
  const styles = await loadStyles();
  const idx = styles.findIndex((style) => style.id === id);
  if (idx === -1) {
    return null;
  }

  const current = styles[idx];
  const next: Style = {
    ...current,
    title: updates.title?.trim() || current.title,
    description: updates.description?.trim() || current.description,
    pricePerGenerationSats:
      updates.pricePerGenerationSats ?? current.pricePerGenerationSats,
  };

  const updated = [...styles];
  updated[idx] = next;
  await saveStyles(updated);
  return next;
}

export async function deleteStyleById(id: string): Promise<boolean> {
  const styles = await loadStyles();
  const updated = styles.filter((style) => style.id !== id);
  if (updated.length === styles.length) {
    return false;
  }
  await saveStyles(updated);
  return true;
}
