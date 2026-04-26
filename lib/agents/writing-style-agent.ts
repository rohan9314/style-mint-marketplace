import { geminiGenerateText } from "@/lib/clients/gemini";
import type { WritingStyle } from "@/types/stylemint";

interface IngestInput {
  creatorId: string;
  creatorName: string;
  title: string;
  pricePerGenerationSats: number;
  description?: string;
  samples: string[];
}

interface WritingStyleProfile {
  proseSummary: string;
  sentenceStructure: string;
  vocabularyLevel: string;
  recurringThemes: string[];
  representativeExcerpts: string[];
}

function parseJsonBlock<T>(text: string): T {
  return JSON.parse(text.replace(/```json|```/g, "").trim()) as T;
}

export async function ingestWritingStyle(
  input: IngestInput,
): Promise<WritingStyle> {
  const samplesBlock = input.samples
    .map((sample, index) => `--- SAMPLE ${index + 1} ---\n${sample}`)
    .join("\n\n");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const text = await geminiGenerateText(`Analyze the following writing samples from a single author. Build a reusable style profile that another writer (you, later) could use to write NEW prose in this exact voice.
${input.description ? `\nAuthor description: ${input.description}\n` : ""}

Return STRICT JSON, no preamble:
{
  "proseSummary": "250-word description of voice, tone, pacing, mood, signature moves",
  "sentenceStructure": "short clinical phrase describing rhythm",
  "vocabularyLevel": "short clinical phrase",
  "recurringThemes": ["3-5 themes"],
  "representativeExcerpts": ["2-3 short verbatim excerpts <40 words each that exemplify the voice"]
}

${samplesBlock}`,
    );
    try {
      const profile = parseJsonBlock<WritingStyleProfile>(text);
      return {
        id: `writer_${Date.now()}`,
        kind: "writing",
        creatorId: input.creatorId,
        creatorName: input.creatorName,
        title: input.title,
        pricePerGenerationSats: input.pricePerGenerationSats,
        description:
          input.description && input.description.length > 0
            ? input.description
            : `${profile.proseSummary.split(".")[0]}.`,
        styleProfile: profile,
        createdAt: new Date().toISOString(),
      };
    } catch {
      if (attempt === 1) {
        throw new Error("Claude returned invalid JSON for writing style ingest.");
      }
    }
  }

  throw new Error("Unreachable");
}

interface GenerateInput {
  style: WritingStyle;
  prompt: string;
}

export async function generateProseInStyle(
  input: GenerateInput,
): Promise<string> {
  const {
    proseSummary,
    sentenceStructure,
    vocabularyLevel,
    recurringThemes,
    representativeExcerpts,
  } = input.style.styleProfile;

  const systemPrompt = `You are writing in the voice of ${input.style.creatorName}.

VOICE PROFILE:
${proseSummary}

Sentence rhythm: ${sentenceStructure}
Vocabulary: ${vocabularyLevel}
Themes you return to: ${recurringThemes.join(", ")}

REFERENCE EXCERPTS — match this energy:
${representativeExcerpts.map((excerpt, i) => `[${i + 1}] "${excerpt}"`).join("\n\n")}

RULES:
- Write 200-400 words of original prose answering the user's prompt
- Match voice, not topic — the prompt sets the topic
- No meta-commentary, no preamble like "Here is..."
- Output the prose only`;

  return geminiGenerateText(`${systemPrompt}\n\nUser prompt: ${input.prompt}`);
}
