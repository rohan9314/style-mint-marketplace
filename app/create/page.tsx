import Link from "next/link";
import { BookOpen, Palette } from "lucide-react";
import { CreateFusionForm } from "./create-fusion-form";

export default function CreateFusionPage() {
  const paymentsEnabled = Boolean(
    process.env.MDK_ACCESS_TOKEN?.trim() && process.env.MDK_MNEMONIC?.trim(),
  );
  const appBaseUrl =
    process.env.APP_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    "";

  return (
    <main className="min-h-screen bg-gradient-soft">
      <div className="mx-auto w-full max-w-4xl px-6 py-10 md:py-14">
        <Link href="/" className="text-sm text-muted-foreground">
          ← Marketplace
        </Link>

        <h1 className="mt-4 inline-flex flex-wrap items-center gap-2 text-3xl font-bold tracking-tight">
          <Palette className="h-8 w-8 text-primary" />
          <BookOpen className="h-8 w-8 text-primary" />
          Story + art fusion
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Combine a visual style with a narrative voice in one generation.
        </p>

        <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-card md:p-8">
          <CreateFusionForm paymentsEnabled={paymentsEnabled} appBaseUrl={appBaseUrl} />
        </div>
      </div>
    </main>
  );
}
