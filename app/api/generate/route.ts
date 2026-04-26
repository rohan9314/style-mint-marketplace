import { randomUUID } from "node:crypto";
import { withPayment } from "@moneydevkit/nextjs/server";
import { generateArtInStyle } from "@/lib/agents/art-style-agent";
import { generateProseInStyle } from "@/lib/agents/writing-style-agent";
import { logEarning } from "@/lib/lightning/earnings";
import { getStyleById } from "@/lib/store/styles";

interface GenerateBody {
  styleId: string;
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
    const body = (await req.json()) as GenerateBody;
    if (!body.styleId || !body.prompt?.trim()) {
      return Response.json(
        { error: "styleId and prompt are required." },
        { status: 400 },
      );
    }

    const style = await getStyleById(body.styleId);

    if (!style) {
      return Response.json({ error: "Style not found" }, { status: 404 });
    }

    const generationId = `gen_${randomUUID()}`;
    const paymentHash = req.headers.get("x-payment-hash") ?? "unknown";
    const buyerKind = req.headers.get("x-buyer-kind") === "agent" ? "agent" : "human";

    let payload: Record<string, unknown>;
    if (style.kind === "art") {
      const outputUrl = await generateArtInStyle({ style, prompt: body.prompt });
      payload = { generationId, kind: "art", outputUrl };
    } else {
      const outputText = await generateProseInStyle({ style, prompt: body.prompt });
      payload = { generationId, kind: "writing", outputText };
    }

    await logEarning({
      styleId: style.id,
      creatorId: style.creatorId,
      amountSats: style.pricePerGenerationSats,
      paymentHash,
      buyerKind,
      generationId,
    });

    return Response.json({
      ...payload,
      paymentHash,
      creatorPaid: style.creatorId,
      amountSats: style.pricePerGenerationSats,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected generation error.";
    return Response.json({ error: message }, { status: 500 });
  }
};

const paidPOST = paymentsEnabled
  ? withPayment(
      {
        amount: async (req: Request) => {
          const body = (await req.clone().json()) as GenerateBody;
          const style = await getStyleById(body.styleId);
          if (!style) {
            throw new Error(`Unknown styleId: ${body.styleId}`);
          }
          return style.pricePerGenerationSats;
        },
        currency: "SAT",
      },
      handler,
    )
  : handler;

export const POST = paidPOST;
