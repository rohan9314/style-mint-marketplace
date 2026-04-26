import { Sparkles } from "lucide-react";
import Link from "next/link";
import { loadStyles } from "@/lib/store/styles";
import { CreatorStudioForm } from "./studio-form";

export default async function CreatorStudioPage() {
  const styles = await loadStyles();
  const recentArtStyles = styles.filter((style) => style.kind === "art").slice(0, 5);

  return (
    <main className="min-h-screen bg-gradient-soft">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 md:py-16">
        <div className="mb-8">
          <h1 className="mt-3 inline-flex items-center gap-2 text-3xl font-bold tracking-tight md:text-4xl">
            <Sparkles className="h-7 w-7 text-primary" />
            Creator Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Upload art references or writing samples, mint your Gemini style agent, and publish it instantly for buyers.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-semibold text-foreground"
            >
              Browse Marketplace
            </Link>
            <a
              href="#creator-form"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Upload New Agent
            </a>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div
            id="creator-form"
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-card md:p-6"
          >
            <CreatorStudioForm />
          </div>

          <aside className="rounded-2xl border border-border/60 bg-card p-5 shadow-card md:p-6">
            <h2 className="text-base font-semibold">Recently Minted Art Styles</h2>
            <div className="mt-4 space-y-3">
              {recentArtStyles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No art styles yet. Mint your first style agent.
                </p>
              ) : (
                recentArtStyles.map((style) => (
                  <div key={style.id} className="rounded-xl border border-border/60 bg-background p-3">
                    <p className="text-sm font-semibold">{style.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">by {style.creatorName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {style.pricePerGenerationSats} sats per generation
                    </p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
