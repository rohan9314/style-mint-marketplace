import type { Style } from "@/types/stylemint";
import { ingestArtStyle } from "@/lib/agents/art-style-agent";
import { ingestWritingStyle } from "@/lib/agents/writing-style-agent";
import { loadStyles, saveStyles } from "@/lib/store/styles";

const artSamples = [
  "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
  "https://images.unsplash.com/photo-1514565131-fce0801e5785",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
];

const writingSamples = [
  `Rain dragged silver lines down the harbor windows while the keeper counted the seconds between each wave strike. He still wrote every hour, as if the sea respected schedules.`,
  `The lantern had its own breath. It inhaled oil, exhaled warning. In town they said the light was mechanical; only he knew it was stubborn.`,
  `By dawn, gulls arrived like unpaid debts. He penciled one last note in the ledger: "Visibility poor. Resolve intact."`,
];

export async function seedDemoStyles(options?: {
  replaceExisting?: boolean;
}): Promise<{ added: number; total: number }> {
  const replaceExisting = options?.replaceExisting ?? false;
  const existing = await loadStyles();

  if (!replaceExisting) {
    const hasArt = existing.some((style) => style.id === "art_001");
    const hasWriter = existing.some((style) => style.id === "writer_001");
    if (hasArt && hasWriter) {
      return { added: 0, total: existing.length };
    }
  }

  const nextStyles: Style[] = replaceExisting ? [] : [...existing];

  const art = await ingestArtStyle({
    creatorId: "creator_001",
    creatorName: "Mira Vex",
    title: "Neon Noir Portraits",
    description: "Cinematic noir portraits lit by neon signs and rainy urban reflections.",
    pricePerGenerationSats: 21,
    imageUrls: artSamples,
  });
  art.id = "art_001";

  const writing = await ingestWritingStyle({
    creatorId: "creator_002",
    creatorName: "Elias Quill",
    title: "Storm Ledger Prose",
    description: "Weather-worn, reflective maritime prose with concise emotional punch.",
    pricePerGenerationSats: 21,
    samples: writingSamples,
  });
  writing.id = "writer_001";

  const withoutOldDemo = nextStyles.filter(
    (style) => style.id !== "art_001" && style.id !== "writer_001",
  );
  const merged = [art, writing, ...withoutOldDemo];
  await saveStyles(merged);

  return {
    added: 2,
    total: merged.length,
  };
}
