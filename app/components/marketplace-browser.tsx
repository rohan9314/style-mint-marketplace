"use client";

import { useMemo, useState } from "react";
import { Palette, PenLine } from "lucide-react";

interface MarketplaceStyle {
  id: string;
  kind: "art" | "writing";
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  pricePerGenerationSats: number;
}

interface Props {
  initialStyles: MarketplaceStyle[];
}

export function MarketplaceBrowser({ initialStyles }: Props) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | "art" | "writing">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialStyles.filter((style) => {
      if (kind !== "all" && style.kind !== kind) {
        return false;
      }
      if (!q) {
        return true;
      }
      const blob = `${style.title} ${style.description} ${style.creatorName}`.toLowerCase();
      return blob.includes(q);
    });
  }, [initialStyles, kind, query]);

  return (
    <section id="marketplace" className="mx-auto w-full max-w-6xl px-6 pb-16">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          suppressHydrationWarning
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, creator, or vibe..."
          className="min-w-64 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm"
        />
        <div className="inline-flex rounded-full border border-border/70 bg-background p-1">
          {(["all", "art", "writing"] as const).map((option) => (
            <button
              key={option}
              type="button"
              suppressHydrationWarning
              onClick={() => setKind(option)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                kind === option
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {option === "all" ? "All" : option === "art" ? "Art" : "Writing"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 text-sm text-muted-foreground">{filtered.length} styles found</div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((style) => (
          <article
            key={style.id}
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-semibold">
                {style.kind === "art" ? (
                  <>
                    <Palette className="h-3.5 w-3.5" />
                    Art
                  </>
                ) : (
                  <>
                    <PenLine className="h-3.5 w-3.5" />
                    Writing
                  </>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {style.pricePerGenerationSats} sats
              </span>
            </div>
            <h3 className="text-lg font-semibold">{style.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{style.description}</p>
            <p className="mt-3 text-xs text-muted-foreground">by {style.creatorName}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Available for paid generation via API (`/api/generate`)
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
