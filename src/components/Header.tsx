import { useEffect, useState } from "react";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Explore", href: "#marketplace" },
  { label: "Creators", href: "#creators" },
  { label: "My Styles", href: "#" },
  { label: "Pricing", href: "#" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-smooth ${
        scrolled ? "glass border-b border-border/60 shadow-soft" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-2 group">
          <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-primary shadow-soft group-hover:shadow-glow transition-smooth">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Style <span className="text-gradient">Mint</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm">Sign In</Button>
          <Button variant="hero" size="sm">Start Creating</Button>
        </div>

        <button
          className="md:hidden h-10 w-10 grid place-items-center rounded-full hover:bg-accent transition-smooth"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-border/60 animate-fade-in">
          <div className="container mx-auto py-4 flex flex-col gap-1">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-accent transition-smooth"
              >
                {item.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1">Sign In</Button>
              <Button variant="hero" className="flex-1">Start Creating</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
