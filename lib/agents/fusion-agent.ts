import { generateArtInStyle } from "@/lib/agents/art-style-agent";
import { generateProseInStyle } from "@/lib/agents/writing-style-agent";
import type { ArtStyle, WritingStyle } from "@/types/stylemint";

export interface FusionInput {
  artStyle: ArtStyle;
  writingStyle: WritingStyle;
  prompt: string;
}

export interface FusionOutput {
  storyText: string;
  imageUrl: string | null;
  imageError?: string;
  pages: Array<{
    pageNumber: number;
    paragraph: string;
    imageUrl: string | null;
    imageError?: string;
  }>;
}

/**
 * Writes prose in the selected writing voice, then renders a key scene
 * in the selected art style using the story as visual context.
 */
export async function generateFusion(input: FusionInput): Promise<FusionOutput> {
  const storyText = await generateProseInStyle({
    style: input.writingStyle,
    prompt: input.prompt,
  });

  const paragraphs = storyText
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
  const normalizedParagraphs = paragraphs.length > 0 ? paragraphs : [storyText.trim()];

  const pages: FusionOutput["pages"] = [];

  for (const [index, paragraph] of normalizedParagraphs.entries()) {
    const pageNumber = index + 1;
    const artPrompt = `${input.prompt}

Illustrate this specific page from the story as a cinematic book illustration.
Match the selected art style references closely.

Page ${pageNumber} text:
---
${paragraph.slice(0, 1800)}
---`;

    try {
      const imageUrl = await generateArtInStyle({
        style: input.artStyle,
        prompt: artPrompt,
      });
      pages.push({ pageNumber, paragraph, imageUrl });
    } catch (error) {
      const imageError =
        error instanceof Error
          ? error.message
          : "Image generation failed for this page.";
      pages.push({ pageNumber, paragraph, imageUrl: null, imageError });
    }
  }

  const firstSuccessPage = pages.find((page) => page.imageUrl);
  const firstErrorPage = pages.find((page) => page.imageError);

  return {
    storyText,
    imageUrl: firstSuccessPage?.imageUrl ?? null,
    imageError: firstSuccessPage ? undefined : firstErrorPage?.imageError,
    pages,
  };
}
