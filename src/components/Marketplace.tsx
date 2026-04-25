import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Palette, PenLine, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArtStyleCard, WritingStyleCard } from "./StyleCard";
import { artStyles, writingStyles, TONES, type Tone } from "@/data/styles";

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
  const [activeTones, setActiveTones] = useState<Tone[]>([]);

  const toggleTone = (t: Tone) =>
    setActiveTones((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const sorter = <T extends { uses: number; rating: number; tag: string }>(arr: T[]) => {
    const a = [...arr];
    switch (sort) {
      case "popular":
        return a.sort((x, y) => y.uses - x.uses);
      case "rating":
        return a.sort((x, y) => y.rating - x.rating);
      case "trending":
        return a.sort((x, y) => Number(y.tag === "Trending") - Number(x.tag === "Trending"));
      case "newest":
        return a.sort((x, y) => Number(y.tag === "New") - Number(x.tag === "New"));
    }
  };

  const matches = <T extends { title: string; description: string; longDescription: string; tones: Tone[] }>(s: T) => {
    const q = query.toLowerCase().trim();
    const text = `${s.title} ${s.description} ${s.longDescription} ${s.tones.join(" ")}`.toLowerCase();
    const queryOk = !q || text.includes(q);
    const toneOk = activeTones.length === 0 || activeTones.every((t) => s.tones.includes(t));
    return queryOk && toneOk;
  };

  const filteredArt = useMemo(() => sorter(artStyles.filter(matches)), [query, sort, activeTones]);
  const filteredWriting = useMemo(() => sorter(writingStyles.filter(matches)), [query, sort, activeTones]);

  const items = tab === "art" ? filteredArt : filteredWriting;

  return (
    <section id="marketplace" className="relative py-20 md:py-28">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Marketplace</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Styles inspired by <span className="text-gradient">your favorites</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Make art that feels like Ranking of Kings. Write a story with the soul of Harry Potter. Pick a vibe and start creating.
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
        <div className="flex flex-col md:flex-row gap-3 mb-5 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by franchise, tone, or genre..."
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

        {/* Tone filter chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-3xl mx-auto">
          {TONES.map((t) => {
            const active = activeTones.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTone(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-smooth ${
                  active
                    ? "bg-gradient-primary text-primary-foreground border-transparent shadow-soft"
                    : "bg-card text-muted-foreground border-border/60 hover:text-foreground hover:border-primary/40"
                }`}
              >
                {t}
              </button>
            );
          })}
          {activeTones.length > 0 && (
            <button
              onClick={() => setActiveTones([])}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No styles match your filters. Try clearing a chip or a different search.
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
