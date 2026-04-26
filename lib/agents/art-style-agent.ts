import { geminiGenerateImage, geminiGenerateText } from "@/lib/clients/gemini";
import type { ArtStyle } from "@/types/stylemint";

interface IngestInput {
  creatorId: string;
  creatorName: string;
  title: string;
  pricePerGenerationSats: number;
  description?: string;
  imageUrls: string[];
}

interface ArtStyleProfile {
  visualSummary: string;
  keywords: string[];
  palette: string[];
}

function parseJsonBlock<T>(text: string): T {
  return JSON.parse(text.replace(/```json|```/g, "").trim()) as T;
}

type SupportedMediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

function parseDataUrl(sample: string): { mediaType: SupportedMediaType; data: string } {
  const match = sample.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid data URL image sample.");
  }

  const mediaType = match[1];
  const data = match[2];
  const safeMediaType: SupportedMediaType =
    mediaType === "image/png" ||
    mediaType === "image/webp" ||
    mediaType === "image/gif"
      ? mediaType
      : "image/jpeg";

  return { mediaType: safeMediaType, data };
}

async function remoteUrlToBase64(url: string): Promise<{
  mimeType: SupportedMediaType;
  data: string;
}> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image URL sample: ${url}`);
  }

  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const mimeType: SupportedMediaType =
    contentType.includes("png")
      ? "image/png"
      : contentType.includes("webp")
        ? "image/webp"
        : contentType.includes("gif")
          ? "image/gif"
          : "image/jpeg";

  const bytes = await res.arrayBuffer();
  const data = Buffer.from(bytes).toString("base64");
  return { mimeType, data };
}

async function getImagePart(sample: string) {
  if (sample.startsWith("data:")) {
    const parsed = parseDataUrl(sample);
    return {
      inline_data: {
        mime_type: parsed.mediaType,
        data: parsed.data,
      },
    };
  }

  const { mimeType, data } = await remoteUrlToBase64(sample);
  return {
    inline_data: {
      mime_type: mimeType,
      data,
    },
  };
}

export async function ingestArtStyle(input: IngestInput): Promise<ArtStyle> {
  const imageParts = await Promise.all(input.imageUrls.slice(0, 5).map(getImagePart));
  const creatorDescription = input.description?.trim();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const text = await geminiGenerateText(
      `You are analyzing an artist's portfolio to extract a reusable visual-style fingerprint.
${creatorDescription ? `\nArtist description: ${creatorDescription}\n` : ""}
Return STRICT JSON, no preamble, no markdown fences:
{
  "visualSummary": "200-word description of subject matter, lighting, color theory, line quality, composition tendencies, mood",
  "keywords": ["8-12 short evocative tags"],
  "palette": ["#hex", "#hex", "..."]
}`,
      imageParts,
    );
    try {
      const profile = parseJsonBlock<ArtStyleProfile>(text);
      return {
        id: `art_${Date.now()}`,
        kind: "art",
        creatorId: input.creatorId,
        creatorName: input.creatorName,
        title: input.title,
        pricePerGenerationSats: input.pricePerGenerationSats,
        description:
          creatorDescription && creatorDescription.length > 0
            ? creatorDescription
            : `${profile.visualSummary.split(".")[0]}.`,
        styleProfile: profile,
        referenceImageUrls: input.imageUrls.slice(0, 8),
        createdAt: new Date().toISOString(),
      };
    } catch {
      if (attempt === 1) {
        throw new Error("Gemini returned invalid JSON for art style ingest.");
      }
    }
  }

  throw new Error("Unreachable");
}

interface GenerateInput {
  style: ArtStyle;
  prompt: string;
}

export async function generateArtInStyle(input: GenerateInput): Promise<string> {
  const referenceImageParts = await Promise.all(
    input.style.referenceImageUrls.slice(0, 4).map(getImagePart),
  );

  const conditionedPrompt = `Create one image in this style.

User request: ${input.prompt}

Style title: ${input.style.title}
Style description: ${input.style.description}
Style fingerprint: ${input.style.styleProfile.visualSummary}
Palette: ${input.style.styleProfile.palette.join(", ")}
Aesthetic keywords: ${input.style.styleProfile.keywords.join(", ")}

Output only the generated image.`;

  try {
    return await geminiGenerateImage(conditionedPrompt, referenceImageParts);
  } catch (error) {
    const firstError = error instanceof Error ? error.message : String(error);
    const noReferencePrompt = `${conditionedPrompt}

If reference images cannot be used, still generate a new image that faithfully matches the described style profile.`;

    try {
      return await geminiGenerateImage(noReferencePrompt);
    } catch (retryError) {
      const secondError = retryError instanceof Error ? retryError.message : String(retryError);
      throw new Error(
        `Image generation failed with references, then failed on text-only retry. withRefs=${firstError} | textOnly=${secondError}`,
      );
    }
  }
}

