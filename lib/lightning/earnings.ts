import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { EarningEvent, EarningsFile } from "@/types/stylemint";
import {
  cloudGet,
  cloudSet,
  isCloudStoreEnabled,
  STORE_KEYS,
} from "@/lib/store/cloud-store";

const defaultDataDir = path.join(process.cwd(), "data");
const fallbackDataDir = path.join("/tmp", "stylemint-data");
let resolvedDataDir: string | null = null;
let earningsPath: string = path.join(defaultDataDir, "earnings.json");

let cache: EarningEvent[] | null = null;
let writeLock: Promise<void> = Promise.resolve();

async function ensureEarningsFile(): Promise<void> {
  const candidates = [
    process.env.STYLEMINT_DATA_DIR?.trim(),
    resolvedDataDir,
    defaultDataDir,
    fallbackDataDir,
  ].filter((dir): dir is string => Boolean(dir));

  let lastError: unknown = null;
  for (const candidate of candidates) {
    const candidatePath = path.join(candidate, "earnings.json");
    try {
      await mkdir(candidate, { recursive: true });
      try {
        await readFile(candidatePath, "utf-8");
      } catch {
        const initial: EarningsFile = { events: [] };
        await writeFile(candidatePath, JSON.stringify(initial, null, 2), "utf-8");
      }
      resolvedDataDir = candidate;
      earningsPath = candidatePath;
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to initialize earnings storage directory. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

async function ensureEarningsStorageReady(): Promise<void> {
  if (isCloudStoreEnabled()) {
    return;
  }
  await ensureEarningsFile();
}

async function loadEvents(): Promise<EarningEvent[]> {
  if (cache) {
    return cache;
  }
  if (isCloudStoreEnabled()) {
    const remote = await cloudGet<EarningsFile>(STORE_KEYS.earnings);
    cache = remote?.events ?? [];
    return cache;
  }
  await ensureEarningsStorageReady();
  const raw = await readFile(earningsPath, "utf-8");
  const parsed = JSON.parse(raw) as EarningsFile;
  cache = parsed.events;
  return cache;
}

async function writeEvents(events: EarningEvent[]): Promise<void> {
  if (isCloudStoreEnabled()) {
    await cloudSet<EarningsFile>(STORE_KEYS.earnings, { events });
    cache = events;
    return;
  }

  await ensureEarningsStorageReady();
  const tempPath = `${earningsPath}.tmp`;
  await writeFile(tempPath, JSON.stringify({ events }, null, 2), "utf-8");
  await rename(tempPath, earningsPath);
  cache = events;
}

export async function logEarning(
  event: Omit<EarningEvent, "id" | "timestamp">,
): Promise<void> {
  writeLock = writeLock.then(async () => {
    const events = await loadEvents();
    const next: EarningEvent = {
      ...event,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };
    await writeEvents([next, ...events]);
  });
  return writeLock;
}

export async function getEarningsForCreator(
  creatorId: string,
): Promise<EarningEvent[]> {
  const events = await loadEvents();
  return events.filter((event) => event.creatorId === creatorId);
}
