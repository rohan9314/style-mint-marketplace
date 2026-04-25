import { Sparkles, Twitter, MessageCircle } from "lucide-react";

const links = ["About", "Terms", "Privacy", "Contact"];

const Footer = () => {
  return (
    <footer className="border-t border-border/60 bg-gradient-soft">
      <div className="container mx-auto py-14">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-primary shadow-soft">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Style <span className="text-gradient">Mint</span>
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-1">
            {links.map((l) => (
              <a
                key={l}
                href="#"
                className="px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
              >
                {l}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href="#" aria-label="Twitter" className="h-10 w-10 grid place-items-center rounded-full border border-border bg-card hover:bg-accent hover:border-primary/30 transition-smooth">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Discord" className="h-10 w-10 grid place-items-center rounded-full border border-border bg-card hover:bg-accent hover:border-primary/30 transition-smooth">
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row gap-2 justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Style Mint. Crafted for creators.</p>
          <p>Built with ✨ — premium styles, instantly.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
