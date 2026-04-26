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
] as const;

function getTextApiKey(): string {
  const candidates = [
    process.env.GOOGLE_GEMINI_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.NANO_BANANA_API_KEY,
    process.env.GOOGLE_API_KEY,
  ];
  const key = candidates
    .map((value) => value?.trim().replace(/^['"]|['"]$/g, ""))
    .find((value) => Boolean(value));
  if (!key) {
    throw new Error(
      "Missing Gemini API key. Set GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY.",
    );
  }
  return key;
}

function getImageApiKey(): string {
  const candidates = [
    process.env.NANO_BANANA_API_KEY,
    process.env.GOOGLE_GEMINI_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
  ];
  const key = candidates
    .map((value) => value?.trim().replace(/^['"]|['"]$/g, ""))
    .find((value) => Boolean(value));
  if (!key) {
    throw new Error(
      "Missing image API key. Set NANO_BANANA_API_KEY or GOOGLE_GEMINI_API_KEY.",
    );
  }
  return key;
}

async function callGemini(
  model: string,
  body: Record<string, unknown>,
  apiKey: string,
): Promise<GeminiResponse> {
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
  const apiKey = getTextApiKey();
  const response = await callGemini(model, {
    contents: [
      {
        role: "user",
        parts: [...parts, { text: prompt }],
      },
    ],
  }, apiKey);

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
  const apiKey = getImageApiKey();
  const configuredModel = process.env.GEMINI_IMAGE_MODEL?.trim();
  const modelCandidates = (
    configuredModel
      ? [configuredModel]
      : Array.from(new Set([model, ...IMAGE_MODELS]))
  ).filter((candidate) => !candidate.toLowerCase().startsWith("imagen-"));

  let lastError: unknown = null;
  const attempts: string[] = [];

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
      }, apiKey);

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
      const reason = error instanceof Error ? error.message : String(error);
      attempts.push(`${candidate}: ${reason}`);
    }
  }

  const reason = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `No available Gemini image model worked. Set GEMINI_IMAGE_MODEL to a supported model for your key. Last error: ${reason}. Attempts: ${attempts.join(" || ")}`,
  );
}
