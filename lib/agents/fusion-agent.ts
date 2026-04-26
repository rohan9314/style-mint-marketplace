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

  const excerpt = storyText.slice(0, 1500);
  const artPrompt = `${input.prompt}

Illustrate one striking scene from this story (composition, mood, and setting — match the art style references):
---
${excerpt}
---`;

  try {
    const imageUrl = await generateArtInStyle({
      style: input.artStyle,
      prompt: artPrompt,
    });
    return { storyText, imageUrl };
  } catch (error) {
    const imageError =
      error instanceof Error
        ? error.message
        : "Image generation failed, but story generation succeeded.";
    return { storyText, imageUrl: null, imageError };
  }
}
