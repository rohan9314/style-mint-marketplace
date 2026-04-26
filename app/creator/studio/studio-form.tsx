"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

const MAX_IMAGES = 8;
const MAX_WRITING_SAMPLES = 5;
interface ManagedStyle {
  id: string;
  kind: "art" | "writing";
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  pricePerGenerationSats: number;
}

async function fileToText(file: File): Promise<string> {
  return file.text();
}

async function parseJsonResponse<T extends object = Record<string, unknown>>(
  response: Response,
  endpoint?: string,
): Promise<T> {
  const text = await response.text();
  const requestTarget = endpoint || response.url || "unknown endpoint";

  if (!response.ok) {
    console.error("[api-failure]", {
      requestUrl: requestTarget,
      statusCode: response.status,
      responseText: text.slice(0, 1000),
    });
  }

  if (!text.trim()) {
    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status} for ${requestTarget} and empty response body.`,
      );
    }
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Request returned invalid JSON from ${requestTarget}. Status: ${response.status}. Body: ${text.slice(0, 500)}`,
    );
  }
}

export function CreatorStudioForm() {
  const [kind, setKind] = useState<"art" | "writing">("art");
  const [creatorName, setCreatorName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceSats, setPriceSats] = useState(21);
  const [files, setFiles] = useState<File[]>([]);
  const [writingText, setWritingText] = useState("");
  const [writingFiles, setWritingFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [uploadWarning, setUploadWarning] = useState("");
  const [createdStyleId, setCreatedStyleId] = useState<string | null>(null);
  const [myStyles, setMyStyles] = useState<ManagedStyle[]>([]);
  const [loadingMyStyles, setLoadingMyStyles] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, previewUrl: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [previews]);

  function handleAddReferenceImages(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots = MAX_IMAGES - files.length;
    if (remainingSlots <= 0) {
      setUploadWarning(`You can upload up to ${MAX_IMAGES} reference images.`);
      event.target.value = "";
      return;
    }

    const imagesToAdd = selectedFiles.slice(0, remainingSlots);
    setFiles((prev) => [...prev, ...imagesToAdd]);

    if (selectedFiles.length > remainingSlots) {
      setUploadWarning(
        `Only ${remainingSlots} image${remainingSlots === 1 ? "" : "s"} added. You can upload up to ${MAX_IMAGES} total.`,
      );
    } else {
      setUploadWarning("");
    }

    // Allow selecting the same file again after removing it.
    event.target.value = "";
  }

  function handleRemoveReferenceImage(indexToRemove: number) {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setUploadWarning("");
  }

  async function refreshMyStyles(targetCreatorId?: string) {
    const creatorId =
      targetCreatorId ??
      `creator_${creatorName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
    if (!creatorId || creatorId === "creator_") {
      return;
    }

    setLoadingMyStyles(true);
    try {
      const endpoint = `/api/style/list?full=1&creatorId=${encodeURIComponent(creatorId)}`;
      const res = await fetch(endpoint);
      const payload = await parseJsonResponse<{ styles?: ManagedStyle[]; error?: string }>(
        res,
        endpoint,
      );
      if (!res.ok) {
        throw new Error(payload.error ?? "Failed loading your styles.");
      }
      setMyStyles(Array.isArray(payload.styles) ? payload.styles : []);
    } finally {
      setLoadingMyStyles(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");
    setCreatedStyleId(null);

    try {
      if (!creatorName.trim() || !title.trim()) {
        throw new Error("Creator name and title are required.");
      }

      let samples: string[] = [];
      if (kind === "art") {
        if (files.length < 3) {
          throw new Error("Upload at least 3 reference images.");
        }
      } else {
        const pastedSamples = writingText
          .split(/\n\s*\n/g)
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0);

        const uploadedSamples = await Promise.all(
          writingFiles.slice(0, MAX_WRITING_SAMPLES).map(fileToText),
        );
        const normalizedUploads = uploadedSamples
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0);

        samples = [...pastedSamples, ...normalizedUploads].slice(0, MAX_WRITING_SAMPLES);
        if (samples.length < 2) {
          throw new Error("Provide at least 2 writing samples (paste text and/or upload .txt files).");
        }
      }

      const creatorId = `creator_${creatorName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;

      const endpoint = "/api/style/create";
      const res =
        kind === "art"
          ? await (async () => {
              const formData = new FormData();
              formData.append("creatorName", creatorName.trim());
              formData.append("styleTitle", title.trim());
              formData.append("styleDescription", description.trim());
              formData.append("priceSats", String(priceSats));
              files.slice(0, MAX_IMAGES).forEach((file) => {
                formData.append("referenceImages", file);
              });

              return fetch(endpoint, {
                method: "POST",
                body: formData,
              });
            })()
          : await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                kind,
                creatorId,
                creatorName: creatorName.trim(),
                title: title.trim(),
                description: description.trim(),
                pricePerGenerationSats: priceSats,
                samples,
              }),
            });

      const payload = await parseJsonResponse<{ styleId?: string; error?: string }>(res, endpoint);
      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to create style.");
      }

      setStatus("success");
      setCreatedStyleId(payload.styleId ?? null);
      setUploadWarning("");
      setMessage(
        kind === "art"
          ? "Art style agent minted and deployed to marketplace."
          : "Writing style agent minted and deployed to marketplace.",
      );
      setFiles([]);
      setWritingFiles([]);
      setWritingText("");
      await refreshMyStyles(creatorId);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unexpected error while creating style.");
    }
  }

  async function handleDelete(styleId: string) {
    const res = await fetch(`/api/style/${styleId}`, { method: "DELETE" });
    if (!res.ok) {
      setStatus("error");
      setMessage("Failed to delete style.");
      return;
    }
    setMyStyles((prev) => prev.filter((style) => style.id !== styleId));
  }

  async function handleQuickPriceUpdate(styleId: string, nextPrice: number) {
    const res = await fetch(`/api/style/${styleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pricePerGenerationSats: nextPrice }),
    });
    if (!res.ok) {
      setStatus("error");
      setMessage("Failed to update style price.");
      return;
    }
    setMyStyles((prev) =>
      prev.map((style) =>
        style.id === styleId ? { ...style, pricePerGenerationSats: nextPrice } : style,
      ),
    );
  }

  async function handleDemoSeed() {
    setStatus("submitting");
    setMessage("");
    try {
      const endpoint = "/api/demo/seed";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replaceExisting: false }),
      });
      const payload = await parseJsonResponse<{ added?: number; error?: string }>(res, endpoint);
      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to seed demo styles.");
      }
      setStatus("success");
      const addedCount = typeof payload.added === "number" ? payload.added : 0;
      setMessage(
        addedCount === 0
          ? "Demo styles already exist."
          : `Added ${addedCount} demo styles.`,
      );
      await refreshMyStyles();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to seed demo styles.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" suppressHydrationWarning>
      <div>
        <h2 className="text-lg font-semibold">
          Mint Your {kind === "art" ? "Art-Style" : "Writing-Style"} Agent
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {kind === "art"
            ? "Upload 3-8 reference images. Gemini learns your visual fingerprint and deploys it to the marketplace."
            : "Paste writing samples or upload .txt files. Gemini learns your voice and deploys it as a writing agent."}
        </p>
      </div>

      <div className="inline-flex rounded-full border border-border/70 bg-background p-1">
        <button
          type="button"
          onClick={() => setKind("art")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            kind === "art"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Artist Agent
        </button>
        <button
          type="button"
          onClick={() => setKind("writing")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            kind === "writing"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Writer Agent
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Creator Name</span>
          <input
            suppressHydrationWarning
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2"
            placeholder="Mira Vex"
            required
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Style Title</span>
          <input
            suppressHydrationWarning
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2"
            placeholder="Neon Noir Portraits"
            required
          />
        </label>
      </div>

      <label className="space-y-1.5 text-sm">
        <span className="font-medium">Style Description</span>
        <textarea
          suppressHydrationWarning
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2"
          placeholder="Cinematic neon portraits with rain-soaked streets and dramatic low-key lighting."
          required
        />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="font-medium">Price per generation (sats)</span>
        <input
          suppressHydrationWarning
          type="number"
          min={1}
          max={500}
          value={priceSats}
          onChange={(e) => setPriceSats(Number(e.target.value))}
          className="w-full rounded-xl border border-border bg-background px-3 py-2"
          required
        />
      </label>

      {kind === "art" ? (
        <>
          <div className="space-y-1.5 text-sm">
            <span className="font-medium">Reference Images (3-8)</span>
            <input
              suppressHydrationWarning
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddReferenceImages}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-left hover:bg-muted/50"
            >
              Add Reference Images
            </button>
            <p className="text-xs text-muted-foreground">
              3-8 images required. You currently have {files.length}.
            </p>
            {uploadWarning && <p className="text-xs text-amber-700">{uploadWarning}</p>}
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {previews.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="overflow-hidden rounded-xl border border-border/60 bg-background"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.previewUrl} alt={item.name} className="h-24 w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 px-2 py-2">
                    <p className="truncate text-xs text-muted-foreground">{item.name || "Image file"}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveReferenceImage(index)}
                      className="rounded-full border border-red-300 px-2 py-1 text-xs font-semibold text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">
              Paste writing samples (separate each sample with a blank line)
            </span>
            <textarea
              suppressHydrationWarning
              value={writingText}
              onChange={(e) => setWritingText(e.target.value)}
              className="min-h-36 w-full rounded-xl border border-border bg-background px-3 py-2"
              placeholder="Sample 1...

Sample 2..."
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Or upload .txt files (up to 5)</span>
            <input
              suppressHydrationWarning
              type="file"
              accept=".txt,text/plain"
              multiple
              onChange={(e) =>
                setWritingFiles(Array.from(e.target.files ?? []).slice(0, MAX_WRITING_SAMPLES))
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            />
          </label>
        </>
      )}

      <button
        suppressHydrationWarning
        type="submit"
        disabled={status === "submitting" || (kind === "art" && files.length < 3)}
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {status === "submitting" ? "Training and deploying..." : `Create and Deploy ${kind === "art" ? "Art" : "Writer"} Agent`}
      </button>
      <button
        type="button"
        onClick={handleDemoSeed}
        disabled={status === "submitting"}
        className="ml-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground disabled:opacity-50"
      >
        Seed Demo Styles
      </button>

      {message && (
        <p className={`text-sm ${status === "error" ? "text-red-600" : "text-emerald-700"}`}>
          {message}
          {createdStyleId ? ` (styleId: ${createdStyleId})` : ""}
        </p>
      )}

      <div className="border-t border-border/60 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">My Deployed Agents</h3>
          <button
            type="button"
            onClick={() => refreshMyStyles()}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground"
          >
            {loadingMyStyles ? "Loading..." : "Refresh"}
          </button>
        </div>

        {myStyles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No agents loaded yet. Click Refresh after entering creator name, or create one now.
          </p>
        ) : (
          <div className="space-y-2">
            {myStyles.map((style) => (
              <div
                key={style.id}
                className="rounded-xl border border-border/60 bg-background p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{style.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {style.kind === "art" ? "Art" : "Writing"} • {style.id}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(style.id)}
                    className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-700"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Price</label>
                  <input
                    type="number"
                    min={1}
                    defaultValue={style.pricePerGenerationSats}
                    onBlur={(e) =>
                      handleQuickPriceUpdate(style.id, Number(e.currentTarget.value))
                    }
                    className="w-24 rounded-lg border border-border bg-background px-2 py-1 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">sats</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
