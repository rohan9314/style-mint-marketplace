import { ArrowRight, Palette, PenLine, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingCard = ({
  className,
  children,
  delay = "0s",
}: {
  className?: string;
  children: React.ReactNode;
  delay?: string;
}) => (
  <div
    className={`absolute rounded-2xl bg-card/90 backdrop-blur border border-border/60 shadow-elegant p-4 animate-float ${className}`}
    style={{ animationDelay: delay }}
  >
    {children}
  </div>
);

const Hero = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative pt-32 md:pt-40 pb-20 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent border border-primary/10 text-xs font-medium text-primary mb-6 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The marketplace for AI creative styles</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] animate-fade-in-up">
            Discover Styles for <br className="hidden md:block" />
            <span className="text-gradient">Anything You Create</span>
          </h1>

          <p
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.1s", opacity: 0 }}
          >
            Browse curated art and writing styles to power your next creation. Premium templates, ready to remix.
          </p>

          <div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up"
            style={{ animationDelay: "0.2s", opacity: 0 }}
          >
            <Button variant="hero" size="xl" onClick={() => scrollTo("marketplace")}>
              <Palette className="h-5 w-5" />
              Explore Art Styles
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="xl" onClick={() => scrollTo("marketplace")}>
              <PenLine className="h-5 w-5" />
              Explore Writing Styles
            </Button>
          </div>

          <div
            className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in-up"
            style={{ animationDelay: "0.3s", opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br from-mint-300 to-mint-500"
                    style={{ background: `linear-gradient(135deg, hsl(${150 + i * 10} 60% ${70 - i * 5}%), hsl(${160 + i * 10} 70% ${50 - i * 4}%))` }}
                  />
                ))}
              </div>
              <span>12k+ creators</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold text-foreground">4.9</span>
              <span>· 2.3k reviews</span>
            </div>
          </div>
        </div>

        {/* Floating preview cards */}
        <div className="hidden lg:block relative h-0">
          <FloatingCard className="-top-72 -left-4 w-56" delay="0s">
            <div className="h-24 rounded-xl bg-gradient-to-br from-purple-300 to-pink-300 mb-3" />
            <div className="text-xs font-semibold">Cyberpunk</div>
            <div className="text-[11px] text-muted-foreground">Art style · 12.4k uses</div>
          </FloatingCard>

          <FloatingCard className="-top-56 -right-2 w-52" delay="1s">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center">
                <PenLine className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs font-semibold">Sci-Fi Novel</div>
                <div className="text-[11px] text-muted-foreground">Writing</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-muted" />
              <div className="h-1.5 w-3/4 rounded-full bg-muted" />
            </div>
          </FloatingCard>

          <FloatingCard className="-top-32 -left-16 w-48" delay="2s">
            <div className="h-20 rounded-xl bg-gradient-to-br from-mint-200 to-mint-400 mb-2" />
            <div className="text-xs font-semibold">Watercolor</div>
          </FloatingCard>
        </div>
      </div>
    </section>
  );
};

export default Hero;
