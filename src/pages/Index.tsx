import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Marketplace from "@/components/Marketplace";
import CreatorCTA from "@/components/CreatorCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Marketplace />
        <CreatorCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
