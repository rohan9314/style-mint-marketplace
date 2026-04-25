import { ArrowRight, Coins, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Coins, label: "Earn per use" },
  { icon: Users, label: "Reach 12k+ creators" },
  { icon: Sparkles, label: "Featured placement" },
];

const CreatorCTA = () => {
  return (
    <section id="creators" className="py-20 md:py-28">
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 shadow-elegant">
          <div className="absolute inset-0 bg-gradient-primary" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.25),transparent_45%)]" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-10 p-10 md:p-16 items-center text-primary-foreground">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                For creators
              </span>
              <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Have your own style prompts?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/85 max-w-lg">
                Publish your templates and earn from creators using them. Set your price, keep ownership, build your audience.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="xl" className="bg-background text-primary hover:bg-background/90 hover:-translate-y-0.5 shadow-elegant">
                  Become a Creator
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="xl" variant="ghost" className="text-primary-foreground hover:bg-white/15">
                  Learn more
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {features.map(({ icon: Icon, label }, i) => (
                <div
                  key={label}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/15 hover:bg-white/15 transition-smooth"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="h-12 w-12 rounded-xl bg-white/15 grid place-items-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold">{label}</div>
                    <div className="text-sm text-primary-foreground/75">
                      {i === 0 && "Get paid every time your style is used."}
                      {i === 1 && "Tap into a thriving community of makers."}
                      {i === 2 && "Top styles get spotlighted on the home page."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatorCTA;
