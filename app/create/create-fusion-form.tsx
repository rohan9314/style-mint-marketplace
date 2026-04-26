"use client";

import { FormEvent, useEffect, useState } from "react";

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

export function CreateFusionForm() {
  const [styles, setStyles] = useState<ListStyle[]>([]);
  const [artId, setArtId] = useState("");
  const [writingId, setWritingId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "done" | "error" | "payment_required"
  >("idle");
  const [message, setMessage] = useState("");
  const [story, setStory] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageWarning, setImageWarning] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/style/list")
      .then((r) => r.json())
      .then((d: { styles: ListStyle[] }) => setStyles(d.styles ?? []))
      .catch(() => setMessage("Could not load styles."));
  }, []);

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
    setStory(null);
    setImageUrl(null);
    setImageWarning(null);

    try {
      const res = await fetch("/api/generate/fusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artStyleId: artId,
          writingStyleId: writingId,
          prompt: prompt.trim(),
        }),
      });

      const body = await parseResponseBody(res);

      if (res.status === 402) {
        const challenge = (body ?? {}) as {
          amountSats?: unknown;
          invoice?: string;
          paymentHash?: string;
        };
        const amount =
          typeof challenge.amountSats === "number"
            ? challenge.amountSats
            : typeof challenge.amountSats === "string"
              ? Number(challenge.amountSats)
              : totalSats;
        setStatus("payment_required");
        setMessage(
          `Lightning payment required (${Number.isFinite(amount) ? amount : totalSats} sats). Pay the invoice from your wallet, then call this API again with Authorization: L402 <macaroon>:<preimage> (see README / buyer-agent script).`,
        );
        return;
      }
      const data = (body ?? {}) as {
        storyText?: unknown;
        outputUrl?: unknown;
        imageError?: unknown;
        error?: unknown;
      };

      if (!res.ok) {
        throw new Error(formatApiErrorBody(data) || `Request failed (${res.status})`);
      }

      const storyRaw = data.storyText;
      const storyText =
        typeof storyRaw === "string"
          ? storyRaw
          : storyRaw !== undefined
            ? JSON.stringify(storyRaw)
            : null;
      const urlRaw = data.outputUrl;
      const outputUrl =
        typeof urlRaw === "string" ? urlRaw : urlRaw !== undefined ? String(urlRaw) : null;
      const imageError =
        typeof data.imageError === "string" && data.imageError.trim()
          ? data.imageError
          : null;

      setStory(storyText);
      setImageUrl(outputUrl);
      setImageWarning(imageError);
      setStatus("done");
      setMessage(
        imageError
          ? "Story generated. Image generation failed for the current model."
          : "Generated story + illustration.",
      );
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Generation failed.");
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Pick one <strong>art</strong> style and one <strong>writing</strong> style. Gemini writes the story in the
        writer&apos;s voice, then draws a scene in the artist&apos;s look. Price is the sum of both style prices (paid
        via Lightning when MDK is configured).
      </p>

      <form onSubmit={onSubmit} className="space-y-4" suppressHydrationWarning>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Art style</span>
            <select
              suppressHydrationWarning
              required
              value={artId}
              onChange={(e) => setArtId(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="">Choose…</option>
              {artStyles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} — {s.pricePerGenerationSats} sats
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium">Writing style</span>
            <select
              suppressHydrationWarning
              required
              value={writingId}
              onChange={(e) => setWritingId(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="">Choose…</option>
              {writingStyles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} — {s.pricePerGenerationSats} sats
                </option>
              ))}
            </select>
          </label>
        </div>

        {artId && writingId && (
          <p className="text-xs text-muted-foreground">Combined price: {totalSats} sats (before payment).</p>
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
          disabled={status === "loading" || artStyles.length === 0 || writingStyles.length === 0}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {status === "loading" ? "Generating…" : "Generate story + art"}
        </button>
      </form>

      {message && (
        <p
          className={`text-sm ${
            status === "error"
              ? "text-red-600"
              : status === "payment_required"
                ? "text-amber-800 dark:text-amber-200"
                : "text-emerald-700"
          }`}
        >
          {message}
        </p>
      )}

      {story && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold text-muted-foreground">Story</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{story}</p>
          </div>
          {!imageUrl && imageWarning && (
            <div className="rounded-2xl border border-amber-300/70 bg-amber-50 p-5 shadow-card dark:border-amber-700/60 dark:bg-amber-950/30">
              <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Image warning
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-amber-900 dark:text-amber-100">
                {imageWarning}
              </p>
            </div>
          )}
          {imageUrl && (
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
              <h2 className="text-sm font-semibold text-muted-foreground">Visualizer</h2>
              <div className="mt-3 overflow-hidden rounded-xl border border-border/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Generated scene" className="h-auto w-full object-contain" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
