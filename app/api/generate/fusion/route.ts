import { randomUUID } from "node:crypto";
import { withPayment } from "@moneydevkit/nextjs/server";
import { generateFusion } from "@/lib/agents/fusion-agent";
import { logEarning } from "@/lib/lightning/earnings";
import { getStyleById } from "@/lib/store/styles";

interface FusionBody {
  artStyleId: string;
  writingStyleId: string;
  prompt: string;
}

const isProduction = process.env.NODE_ENV === "production";
const hasMdkAccessToken = Boolean(process.env.MDK_ACCESS_TOKEN?.trim());
const skipL402 = process.env.SKIP_L402_DEV === "1";
const paymentsEnabled = hasMdkAccessToken && !skipL402;

if (!hasMdkAccessToken && isProduction) {
  throw new Error("MDK_ACCESS_TOKEN is not configured");
}
if (!hasMdkAccessToken && !isProduction) {
  console.info("Payment mode disabled in local development");
}
const handler = async (req: Request): Promise<Response> => {
  try {
    const body = (await req.json()) as FusionBody;
    if (!body.artStyleId || !body.writingStyleId || !body.prompt?.trim()) {
      return Response.json(
        { error: "artStyleId, writingStyleId, and prompt are required." },
        { status: 400 },
      );
    }

    const art = await getStyleById(body.artStyleId);
    const writing = await getStyleById(body.writingStyleId);

    if (!art || art.kind !== "art") {
      return Response.json({ error: "Art style not found." }, { status: 404 });
    }
    if (!writing || writing.kind !== "writing") {
      return Response.json({ error: "Writing style not found." }, { status: 404 });
    }

    const generationId = `gen_${randomUUID()}`;
    const paymentHash = req.headers.get("x-payment-hash") ?? "unknown";
    const buyerKind = req.headers.get("x-buyer-kind") === "agent" ? "agent" : "human";

    const { storyText, imageUrl, imageError, pages } = await generateFusion({
      artStyle: art,
      writingStyle: writing,
      prompt: body.prompt.trim(),
    });

    if (!storyText?.trim()) {
      return Response.json(
        { error: "Fusion generated no story text. Try again with a clearer prompt." },
        { status: 502 },
      );
    }

    const amountArt = art.pricePerGenerationSats;
    const amountWriting = writing.pricePerGenerationSats;

    await logEarning({
      styleId: art.id,
      creatorId: art.creatorId,
      amountSats: amountArt,
      paymentHash,
      buyerKind,
      generationId,
    });
    await logEarning({
      styleId: writing.id,
      creatorId: writing.creatorId,
      amountSats: amountWriting,
      paymentHash,
      buyerKind,
      generationId,
    });

    const amountSats = amountArt + amountWriting;

    return Response.json({
      generationId,
      kind: "fusion" as const,
      storyText,
      outputUrl: imageUrl,
      imageError: imageError ?? null,
      pages,
      artStyleId: art.id,
      writingStyleId: writing.id,
      paymentHash,
      amountSats,
      creatorsPaid: [
        { creatorId: art.creatorId, amountSats: amountArt, styleId: art.id },
        { creatorId: writing.creatorId, amountSats: amountWriting, styleId: writing.id },
      ],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected fusion generation error.";
    return Response.json({ error: message }, { status: 500 });
  }
};

const paidPOST = paymentsEnabled
  ? withPayment(
      {
        amount: async (req: Request) => {
          const body = (await req.clone().json()) as FusionBody;
          const art = await getStyleById(body.artStyleId);
          const writing = await getStyleById(body.writingStyleId);
          if (!art || art.kind !== "art") {
            throw new Error(`Unknown artStyleId: ${body.artStyleId}`);
          }
          if (!writing || writing.kind !== "writing") {
            throw new Error(`Unknown writingStyleId: ${body.writingStyleId}`);
          }
          return art.pricePerGenerationSats + writing.pricePerGenerationSats;
        },
        currency: "SAT",
      },
      handler,
    )
  : handler;

export const POST = paidPOST;
