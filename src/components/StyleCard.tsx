import { ArrowRight, Star, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ArtStyle, WritingStyle } from "@/data/styles";

const PopularityBadge = ({ label }: { label: string }) => {
  const styles: Record<string, string> = {
    Trending: "bg-gradient-primary text-primary-foreground",
    Popular: "bg-accent text-primary border border-primary/20",
    "Top Rated": "bg-amber-100 text-amber-700 border border-amber-200",
    New: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${styles[label] ?? "bg-muted"}`}>
      <Sparkles className="h-3 w-3" />
      {label}
    </span>
  );
};

const formatUses = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

export const ArtStyleCard = ({ style }: { style: ArtStyle }) => (
  <article className="group relative rounded-3xl bg-card border border-border/60 shadow-card hover:shadow-elegant hover:-translate-y-1 transition-bounce overflow-hidden">
    <div className={`relative aspect-[4/3] bg-gradient-to-br ${style.gradient} overflow-hidden`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_50%)]" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-smooth bg-foreground/10" />
      <div className="absolute top-3 left-3">
        <PopularityBadge label={style.popularity} />
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur text-xs font-semibold">
        <Star className="h-3 w-3 fill-primary text-primary" />
        {style.rating}
      </div>
    </div>
    <div className="p-5">
      <h3 className="font-display font-bold text-lg leading-tight">{style.title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{style.description}</p>
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
    <article className="group relative rounded-3xl bg-card border border-border/60 shadow-card hover:shadow-elegant hover:-translate-y-1 transition-bounce p-5 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${style.accent} grid place-items-center shadow-soft group-hover:scale-110 transition-bounce`}>
          <Icon className="h-7 w-7 text-white drop-shadow" strokeWidth={2.2} />
        </div>
        <PopularityBadge label={style.popularity} />
      </div>
      <h3 className="font-display font-bold text-lg leading-tight">{style.title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 flex-1">{style.description}</p>
      <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span className="font-semibold text-foreground">{style.rating}</span>
          </span>
          <span>{formatUses(style.uses)} uses</span>
        </div>
        <Button size="sm" variant="soft" className="group/btn">
          Use Style
          <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-smooth" />
        </Button>
      </div>
    </article>
  );
};
