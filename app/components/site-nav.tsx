"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

function navClasses(active: boolean): string {
  return active
    ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
    : "rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted";
}

export function SiteNav() {
  const pathname = usePathname();
  const isCreator = pathname.startsWith("/creator/studio");
  const isFusion = pathname.startsWith("/create");

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            Style <span className="text-gradient">Mint</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          <Link href="/" className={navClasses(!isCreator && !isFusion)}>
            Marketplace
          </Link>
          <Link href="/create" className={navClasses(isFusion)}>
            Story + art
          </Link>
          <Link href="/creator/studio" className={navClasses(isCreator)}>
            Creator Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
