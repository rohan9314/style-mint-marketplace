import { ArrowRight, Star, Sparkles, Palette, PenLine } from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ArtStyle, WritingStyle } from "@/data/styles";

const TagBadge = ({ label }: { label: string }) => {
  const styles: Record<string, string> = {
    Trending: "bg-gradient-primary text-primary-foreground",
    Popular: "bg-accent text-primary border border-primary/20",
    "Top Rated": "bg-amber-100 text-amber-700 border border-amber-200",
    Classic: "bg-purple-100 text-purple-700 border border-purple-200",
    New: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
        styles[label] ?? "bg-muted"
      }`}
    >
      <Sparkles className="h-3 w-3" />
      {label}
    </span>
  );
};

const TypePill = ({ type }: { type: "Art" | "Writing" }) => {
  const Icon = type === "Art" ? Palette : PenLine;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-background/85 backdrop-blur text-[10px] font-semibold uppercase tracking-wide text-foreground border border-border/60">
      <Icon className="h-3 w-3" />
      {type}
    </span>
  );
};

const formatUses = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

export const ArtStyleCard = ({ style }: { style: ArtStyle }) => (
  <article className="group relative rounded-3xl bg-card border border-border/60 shadow-card hover:shadow-elegant hover:-translate-y-1 transition-bounce overflow-hidden">
    <div className={`relative aspect-[4/3] bg-gradient-to-br ${style.gradient} overflow-hidden`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <TagBadge label={style.tag} />
        <TypePill type="Art" />
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/85 backdrop-blur text-xs font-semibold">
        <Star className="h-3 w-3 fill-primary text-primary" />
        {style.rating}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <h3 className="font-display font-bold text-xl leading-tight drop-shadow">{style.title}</h3>
      </div>
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-foreground/85 text-background opacity-0 group-hover:opacity-100 transition-smooth p-5 flex flex-col justify-center">
        <p className="text-sm leading-relaxed">{style.longDescription}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(style.tones ?? []).map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-background/15 border border-background/25">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
    <div className="p-5">
      <p className="text-sm text-muted-foreground line-clamp-2">{style.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{formatUses(style.uses)} uses</span>
        <Button size="sm" variant="soft" className="group/btn">
          Use Style
          <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-smooth" />
        </Button>
      </div>
    </div>
  </article>
);

export const WritingStyleCard = ({ style }: { style: WritingStyle }) => {
  const Icon = (Icons as any)[style.icon] ?? Icons.FileText;
  return (
    <article className="group relative rounded-3xl bg-card border border-border/60 shadow-card hover:shadow-elegant hover:-translate-y-1 transition-bounce overflow-hidden flex flex-col">
      <div className={`relative aspect-[4/3] bg-gradient-to-br ${style.accent} overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.55),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <TagBadge label={style.tag} />
          <TypePill type="Writing" />
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/85 backdrop-blur text-xs font-semibold">
          <Star className="h-3 w-3 fill-primary text-primary" />
          {style.rating}
        </div>
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-20 w-20 rounded-3xl bg-background/25 backdrop-blur grid place-items-center group-hover:scale-110 transition-bounce">
            <Icon className="h-10 w-10 text-white drop-shadow" strokeWidth={2.2} />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="font-display font-bold text-xl leading-tight drop-shadow">{style.title}</h3>
        </div>
        <div className="absolute inset-0 bg-foreground/85 text-background opacity-0 group-hover:opacity-100 transition-smooth p-5 flex flex-col justify-center">
          <p className="text-sm leading-relaxed">{style.longDescription}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(style.tones ?? []).map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-background/15 border border-background/25">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{style.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{formatUses(style.uses)} uses</span>
          <Button size="sm" variant="soft" className="group/btn">
            Use Style
            <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-smooth" />
          </Button>
        </div>
      </div>
    </article>
  );
};
