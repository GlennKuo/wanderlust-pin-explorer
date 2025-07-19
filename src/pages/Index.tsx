import { HeroCarousel } from "@/components/HeroCarousel";
import { WorldMap } from "@/components/WorldMap";
import { TravelForm } from "@/components/TravelForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Carousel */}
      <section className="relative">
        <HeroCarousel />
      </section>

      {/* World Map Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
        <WorldMap />
      </section>

      {/* Travel Form Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-muted/20 to-background">
        <TravelForm />
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready for Your Next Adventure?
          </h3>
          <p className="text-muted-foreground mb-6">
            Join thousands of travelers who have discovered their perfect destinations with us.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <span>🌍 195+ Countries</span>
            <span>✈️ 10,000+ Destinations</span>
            <span>💝 Personalized Itineraries</span>
            <span>🌟 Expert Recommendations</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
