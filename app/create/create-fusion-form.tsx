"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCheckout } from "@moneydevkit/nextjs";

interface ListStyle {
  id: string;
  kind: "art" | "writing";
  creatorName: string;
  title: string;
  description: string;
  pricePerGenerationSats: number;
}

function formatApiErrorBody(data: unknown): string {
  if (data === null || data === undefined) {
    return "Request failed.";
  }
  if (typeof data === "string") {
    return data;
  }
  if (typeof data !== "object") {
    return String(data);
  }
  const o = data as Record<string, unknown>;
  const err = o.error;
  if (typeof err === "string") {
    return err;
  }
  if (err && typeof err === "object") {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string") {
      return msg;
    }
    const code = (err as { code?: unknown }).code;
    const suggestion = (err as { suggestion?: unknown }).suggestion;
    const parts = [typeof code === "string" ? code : null, typeof msg === "string" ? msg : null].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(": ");
    }
    if (typeof suggestion === "string") {
      return suggestion;
    }
  }
  if (typeof o.message === "string") {
    return o.message;
  }
  try {
    return JSON.stringify(data);
  } catch {
    return "Request failed.";
  }
}

async function parseResponseBody(res: Response): Promise<unknown> {
  const raw = await res.text();
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function logApiFailure(url: string, status: number, responseText: string): void {
  const payload = {
    requestUrl: url,
    statusCode: status,
    responseText: responseText.slice(0, 1000),
  };
  console.error("[api-failure]", payload);
}

interface CreateFusionFormProps {
  paymentsEnabled: boolean;
  appBaseUrl: string;
}

export function CreateFusionForm({ paymentsEnabled, appBaseUrl }: CreateFusionFormProps) {
  const { createCheckout, isLoading: isCheckoutLoading } = useCheckout();
  const [styles, setStyles] = useState<ListStyle[]>([]);
  const [artId, setArtId] = useState("");
  const [writingId, setWritingId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [apiFailureDetails, setApiFailureDetails] = useState<{
    requestUrl: string;
    statusCode: number;
    responseText: string;
  } | null>(null);

  const artStyles = styles.filter((s) => s.kind === "art");
  const writingStyles = styles.filter((s) => s.kind === "writing");

  const selectedArt = artStyles.find((s) => s.id === artId);
  const selectedWriting = writingStyles.find((s) => s.id === writingId);
  const totalSats =
    (selectedArt?.pricePerGenerationSats ?? 0) +
    (selectedWriting?.pricePerGenerationSats ?? 0);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setApiFailureDetails(null);

    try {
      if (!paymentsEnabled) {
        throw new Error(
          "MoneyDevKit is not configured. Set MDK_ACCESS_TOKEN and MDK_MNEMONIC on the server.",
        );
      }
      if (!artId || !writingId || !prompt.trim()) {
        throw new Error("Select one art style, one writing style, and enter a prompt.");
      }

      const normalizedBaseUrl = appBaseUrl.replace(/\/$/, "");
      if (!normalizedBaseUrl) {
        throw new Error("APP_BASE_URL is required for MoneyDevKit checkout.");
      }
      if (!normalizedBaseUrl.startsWith("https://")) {
        throw new Error("APP_BASE_URL must start with https://");
      }
      if (normalizedBaseUrl.includes("/api/mdk")) {
        throw new Error("APP_BASE_URL must be the base domain only (do not include /api/mdk).");
      }
      if (normalizedBaseUrl.includes("localhost") || normalizedBaseUrl.includes("127.0.0.1")) {
        throw new Error("MDK requires a public webhook URL. Use ngrok or a deployed URL.");
      }
      const webhookUrl = `${normalizedBaseUrl}/api/mdk`;
      const successUrl = `${normalizedBaseUrl}/create?checkout=success`;
      const totalPrice = totalSats;
      if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
        throw new Error("Unable to calculate fusion checkout amount from selected styles.");
      }
      console.info("[mdk-checkout] create requested", {
        appBaseUrl: normalizedBaseUrl,
        webhookUrl,
        mdkRouteExists: true,
        totalPrice,
        amountSats: totalPrice,
      });
      const result = await createCheckout({
        type: "AMOUNT",
        title: "StyleMint Story + Art Generation",
        description: "Checkout for one Story + Art fusion generation.",
        amount: totalPrice,
        currency: "SAT",
        successUrl,
        metadata: {
          flow: "fusion-generate",
          artStyleId: artId,
          writingStyleId: writingId,
          prompt: prompt.trim(),
        },
      });
      console.info("[mdk-checkout] create response", {
        ok: !result.error,
        checkoutUrl: result.error ? null : result.data?.checkoutUrl,
        error: result.error?.message ?? null,
      });

      if (result.error) {
        const responseText = result.error.message ?? "Unknown checkout error";
        logApiFailure(
          "/api/mdk (checkout creation via MoneyDevKit)",
          500,
          responseText,
        );
        setApiFailureDetails({
          requestUrl: "/api/mdk",
          statusCode: 500,
          responseText,
        });
        throw new Error(
          responseText ||
            "Failed to create MoneyDevKit checkout. Please verify MDK environment and dashboard settings.",
        );
      }

      const checkoutUrl = result.data?.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error("Checkout created without a checkout URL.");
      }

      window.location.href = checkoutUrl;
      setStatus("done");
      setMessage("Redirecting to checkout...");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Checkout creation failed.");
    }
  }

  async function loadStyles() {
    const endpoint = "/api/style/list";
    try {
      const res = await fetch(endpoint);
      const body = await parseResponseBody(res);
      const payload = (body ?? {}) as { styles?: ListStyle[] };
      if (!res.ok) {
        const responseText = typeof body === "string" ? body : JSON.stringify(body ?? {});
        logApiFailure(
          endpoint,
          res.status,
          responseText,
        );
        setApiFailureDetails({
          requestUrl: endpoint,
          statusCode: res.status,
          responseText: responseText.slice(0, 1000),
        });
        throw new Error(formatApiErrorBody(body));
      }
      setStyles(payload.styles ?? []);
    } catch {
      setMessage("Could not load styles.");
    }
  }

  useEffect(() => {
    void loadStyles();
  }, []);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Pick one <strong>art</strong> style and one <strong>writing</strong> style. Clicking generate creates a
        MoneyDevKit checkout for the combined selected style price, then redirects you to complete payment.
      </p>
      {!paymentsEnabled && (
        <p className="text-xs text-muted-foreground">
          Payment mode disabled in local development. Configure MDK credentials to enable checkout.
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4" suppressHydrationWarning>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-0.5 text-sm">
            <span className="font-medium">Art style</span>
            <select
              suppressHydrationWarning
              required
              value={artId}
              onChange={(e) => setArtId(e.target.value)}
              className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm leading-5"
            >
              <option value="" className="px-2 py-1.5 text-sm">
                Choose…
              </option>
              {artStyles.map((s) => (
                <option key={s.id} value={s.id} className="px-2 py-1.5 text-sm">
                  {s.title} — {s.pricePerGenerationSats} sats
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-0.5 text-sm">
            <span className="font-medium">Writing style</span>
            <select
              suppressHydrationWarning
              required
              value={writingId}
              onChange={(e) => setWritingId(e.target.value)}
              className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm leading-5"
            >
              <option value="" className="px-2 py-1.5 text-sm">
                Choose…
              </option>
              {writingStyles.map((s) => (
                <option key={s.id} value={s.id} className="px-2 py-1.5 text-sm">
                  {s.title} — {s.pricePerGenerationSats} sats
                </option>
              ))}
            </select>
          </label>
        </div>

        {artId && writingId && (
          <p className="text-xs text-muted-foreground">
            Combined style price: {totalSats} sats. Checkout amount: {totalSats} sats.
          </p>
        )}

        <label className="space-y-1 text-sm">
          <span className="font-medium">What should the story be about?</span>
          <textarea
            suppressHydrationWarning
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-28 w-full rounded-xl border border-border bg-background px-3 py-2"
            placeholder="e.g. A lighthouse keeper’s last night before the storm takes the pier…"
          />
        </label>

        <button
          suppressHydrationWarning
          type="submit"
          disabled={
            status === "loading" ||
            isCheckoutLoading ||
            artStyles.length === 0 ||
            writingStyles.length === 0 ||
            !paymentsEnabled
          }
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {status === "loading" || isCheckoutLoading
            ? "Creating checkout..."
            : `Generate story + art (${totalSats} sats)`}
        </button>
      </form>

      {message && (
        <p className={`text-sm ${status === "error" ? "text-red-600" : "text-emerald-700"}`}>
          {message}
        </p>
      )}
      {status === "error" && apiFailureDetails && (
        <p className="text-xs text-muted-foreground">
          request: {apiFailureDetails.requestUrl} | status: {apiFailureDetails.statusCode} | response:{" "}
          {apiFailureDetails.responseText}
        </p>
      )}
    </div>
  );
}
