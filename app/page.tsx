import Link from "next/link";
import { Sparkles, ArrowRight, Coins } from "lucide-react";
import { loadStyles } from "@/lib/store/styles";
import { MarketplaceBrowser } from "./components/marketplace-browser";

export default async function Home() {
  const styles = await loadStyles();
  const marketplaceStyles = styles.map((style) => ({
    id: style.id,
    kind: style.kind,
    creatorId: style.creatorId,
    creatorName: style.creatorName,
    title: style.title,
    description: style.description,
    pricePerGenerationSats: style.pricePerGenerationSats,
  }));

  return (
    <main className="bg-gradient-soft">
      <section className="mx-auto w-full max-w-6xl px-6 py-16 text-center md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Lightning-paid style marketplace
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
            Discover styles for
            <br className="hidden md:block" /> anything you create
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Use creator-owned art and writing styles. Pay in sats only when you
            generate.
          </p>
          <div className="mt-6">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background px-5 py-2.5 text-sm font-semibold text-primary"
            >
              Combine art + writing in one story
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <MarketplaceBrowser initialStyles={marketplaceStyles} />

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-gradient-primary p-8 text-primary-foreground md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-90">
            For creators
          </p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight">
            Publish your style and earn every generation
          </h3>
          <p className="mt-3 max-w-2xl text-primary-foreground/90">
            StyleMint uses Lightning micropayments so creators get paid in sats
            per use.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
            <Coins className="h-4 w-4" />
            Money moves instantly, globally
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/creator/studio"
              className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-semibold text-black"
            >
              Upload Your Style Agent
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#marketplace"
              className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-transparent px-5 py-2.5 text-sm font-semibold text-white"
            >
              Browse Marketplace
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
