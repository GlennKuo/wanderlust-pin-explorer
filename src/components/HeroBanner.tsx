import heroBannerImage from "@/assets/hero-banner.jpg";

export const HeroBanner = () => {
  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      <div 
        className="w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBannerImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center text-center">
        <div className="max-w-4xl px-6 text-white animate-slide-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-lg">
            Discover Your Next
            <span className="block bg-gradient-hero bg-clip-text text-transparent">
              Adventure
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 drop-shadow-md opacity-90">
            Explore breathtaking destinations around the world
          </p>
        </div>
      </div>
    </div>
  );
};