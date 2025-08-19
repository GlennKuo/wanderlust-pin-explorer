import { WorldMap } from "@/components/WorldMap";
import { HeroBanner } from "@/components/HeroBanner";
import { PlanYourJourney } from "@/components/PlanYourJourney";
import { useState } from "react";
import { LatLngLiteral } from "leaflet";

const Index = () => {
  const [pins, setPins] = useState<LatLngLiteral[]>([]);
  const [selectedPin, setSelectedPin] = useState<LatLngLiteral | null>(null);
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <HeroBanner />

      {/* World Map Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
        <WorldMap pins={pins} onPinsChange={setPins} selectedPin={selectedPin} onSelectedPinChange={setSelectedPin} />
      </section>

      {/* Plan Your Journey Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-muted/20 to-background">
        <PlanYourJourney pins={pins} selectedPin={selectedPin} />
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
