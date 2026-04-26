interface GeminiPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

interface GeminiResponse {
  promptFeedback?: {
    blockReason?: string;
    block_reason?: string;
  };
  candidates?: Array<{
    finishReason?: string;
    finish_reason?: string;
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: { mimeType?: string; data?: string };
        inline_data?: { mime_type?: string; data?: string };
      }>;
    };
  }>;
}

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const IMAGE_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-image-preview",
  "imagen-4.0-fast-generate-001",
] as const;

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("Missing GEMINI_API_KEY.");
  }
  return key;
}

async function callGemini(
  model: string,
  body: Record<string, unknown>,
): Promise<GeminiResponse> {
  const apiKey = getApiKey();
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini request failed (${res.status}): ${text}`);
  }

  return (await res.json()) as GeminiResponse;
}

export async function geminiGenerateText(
  prompt: string,
  parts: GeminiPart[] = [],
  model = process.env.GEMINI_TEXT_MODEL ?? "gemini-2.5-flash",
): Promise<string> {
  const response = await callGemini(model, {
    contents: [
      {
        role: "user",
        parts: [...parts, { text: prompt }],
      },
    ],
  });

  const text =
    response.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? "";

  if (!text) {
    throw new Error("Gemini returned no text output.");
  }

  return text;
}

export async function geminiGenerateImage(
  prompt: string,
  parts: GeminiPart[] = [],
  model = process.env.GEMINI_IMAGE_MODEL ?? IMAGE_MODELS[0],
): Promise<string> {
  const modelCandidates = Array.from(new Set([model, ...IMAGE_MODELS]));

  let lastError: unknown = null;

  for (const candidate of modelCandidates) {
    try {
      const response = await callGemini(candidate, {
        contents: [{ role: "user", parts: [...parts, { text: prompt }] }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          candidateCount: 1,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
        ],
      });

      const responseParts = response.candidates?.[0]?.content?.parts ?? [];
      const finishReason =
        response.candidates?.[0]?.finishReason ??
        response.candidates?.[0]?.finish_reason;
      const imagePart = responseParts.find(
        (part) => (part.inlineData?.data ?? part.inline_data?.data) !== undefined,
      );

      const data = imagePart?.inlineData?.data ?? imagePart?.inline_data?.data;
      const mimeType =
        imagePart?.inlineData?.mimeType ?? imagePart?.inline_data?.mime_type ?? "image/png";

      if (!data) {
        const blockReason =
          response.promptFeedback?.blockReason ??
          response.promptFeedback?.block_reason;
        throw new Error(
          `Gemini model '${candidate}' returned no image output. finishReason=${finishReason ?? "unknown"} blockReason=${blockReason ?? "none"}`,
        );
      }

      return `data:${mimeType};base64,${data}`;
    } catch (error) {
      lastError = error;
    }
  }

  const reason = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `No available Gemini image model worked. Set GEMINI_IMAGE_MODEL to a supported model for your key. Last error: ${reason}`,
  );
}
