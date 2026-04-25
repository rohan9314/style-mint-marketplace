import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Palette, PenLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArtStyleCard, WritingStyleCard } from "./StyleCard";
import { artStyles, writingStyles } from "@/data/styles";

type Tab = "art" | "writing";
type Sort = "popular" | "newest" | "trending" | "rating";

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "trending", label: "Trending" },
  { value: "rating", label: "Highest Rated" },
];

const Marketplace = () => {
  const [tab, setTab] = useState<Tab>("art");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("popular");

  const sorter = <T extends { uses: number; rating: number; popularity: string }>(arr: T[]) => {
    const a = [...arr];
    switch (sort) {
      case "popular":
        return a.sort((x, y) => y.uses - x.uses);
      case "rating":
        return a.sort((x, y) => y.rating - x.rating);
      case "trending":
        return a.sort((x, y) => Number(y.popularity === "Trending") - Number(x.popularity === "Trending"));
      case "newest":
        return a.sort((x, y) => Number(y.popularity === "New") - Number(x.popularity === "New"));
    }
  };

  const filteredArt = useMemo(() => {
    const q = query.toLowerCase();
    return sorter(artStyles.filter((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)));
  }, [query, sort]);

  const filteredWriting = useMemo(() => {
    const q = query.toLowerCase();
    return sorter(writingStyles.filter((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)));
  }, [query, sort]);

  const items = tab === "art" ? filteredArt : filteredWriting;

  return (
    <section id="marketplace" className="relative py-20 md:py-28">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Marketplace</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Browse the <span className="text-gradient">style library</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Curated, hand-tuned templates from top creators. Pick a style and start generating in seconds.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-full bg-muted border border-border/60 shadow-soft">
            {([
              { id: "art", label: "Art", icon: Palette },
              { id: "writing", label: "Writing", icon: PenLine },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-smooth ${
                  tab === id
                    ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === id ? "bg-white/20" : "bg-background"}`}>
                  {id === "art" ? artStyles.length : writingStyles.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div className="flex flex-col md:flex-row gap-3 mb-8 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search styles..."
              className="pl-11 h-12 rounded-full bg-card border-border/60 shadow-soft focus-visible:ring-primary/40"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="md:w-56 h-12 rounded-full bg-card border-border/60 shadow-soft">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No styles match "{query}". Try a different search.
          </div>
        ) : (
          <div key={tab} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {tab === "art"
              ? (items as typeof artStyles).map((s, i) => (
                  <div key={s.id} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${i * 40}ms` }}>
                    <ArtStyleCard style={s} />
                  </div>
                ))
              : (items as typeof writingStyles).map((s, i) => (
                  <div key={s.id} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${i * 40}ms` }}>
                    <WritingStyleCard style={s} />
                  </div>
                ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Marketplace;
