import heroBannerImage from "@/assets/hero-banner.jpg";

export const HeroBanner = () => {
  return (
    <div className="relative w-full h-[85vh] min-h-[700px] overflow-hidden bg-gradient-hero">
      {/* Revolut-style hero content */}
      <div className="absolute inset-0 flex items-center text-left">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-3xl animate-slide-up">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-none tracking-tight">
              CHANGE THE WAY
              <br />
              <span className="text-white/90">YOU TRAVEL</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl leading-relaxed">
              Home or away, local or global — move freely between countries and cultures. 
              Plan your perfect journey, in a tap.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-secondary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-secondary/90 hover:scale-105 transition-all duration-200 shadow-dark">
                Start Planning
              </button>
              <button className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm">
                Explore Destinations
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-primary/10" />
    </div>
  );
};