import "dotenv/config";
import { MoneyDevKitNode } from "@moneydevkit/core";

const BASE =
  process.env.APP_BASE_URL ??
  process.env.NEXT_PUBLIC_APP_BASE_URL ??
  process.env.NEXT_PUBLIC_BASE_URL ??
  "http://localhost:3000";

async function main(): Promise<void> {
  const [, , styleId, prompt] = process.argv;

  if (!styleId || !prompt) {
    console.error('Usage: npm run buyer-agent -- <styleId> "<prompt>"');
    process.exit(1);
  }

  const accessToken = process.env.MDK_ACCESS_TOKEN;
  const mnemonic = process.env.MDK_MNEMONIC;
  if (!accessToken || !mnemonic) {
    throw new Error("Missing MDK_ACCESS_TOKEN or MDK_MNEMONIC in environment.");
  }

  const wallet = new MoneyDevKitNode({
    accessToken,
    mnemonic,
  });

  console.log(`Agent requesting generation from style ${styleId}`);

  const challengeRes = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-buyer-kind": "agent",
    },
    body: JSON.stringify({ styleId, prompt }),
  });

  if (challengeRes.status !== 402) {
    console.log("Unexpected status:", challengeRes.status, await challengeRes.text());
    return;
  }

  const { invoice, macaroon, amountSats } = (await challengeRes.json()) as {
    invoice: string;
    macaroon: string;
    amountSats: number;
  };
  console.log(`Paywall hit: ${amountSats} sats required.`);

  const payment = wallet.pay(invoice);
  if (!payment.preimage || !payment.paymentHash) {
    throw new Error("Lightning payment failed; missing preimage or payment hash.");
  }
  console.log(
    `Paid invoice. hash=${payment.paymentHash.slice(0, 12)}... preimage=${payment.preimage.slice(0, 12)}...`,
  );

  const generationRes = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-buyer-kind": "agent",
      "x-payment-hash": payment.paymentHash,
      Authorization: `L402 ${macaroon}:${payment.preimage}`,
    },
    body: JSON.stringify({ styleId, prompt }),
  });

  const result = await generationRes.json();
  if (result?.kind === "art" && typeof result.outputUrl === "string") {
    const compactResult = {
      ...result,
      outputUrl: result.outputUrl.startsWith("data:")
        ? `${result.outputUrl.slice(0, 64)}... (base64 image)`
        : result.outputUrl,
    };
    console.log("Generation response:", compactResult);
    return;
  }

  console.log("Generation response:", result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
