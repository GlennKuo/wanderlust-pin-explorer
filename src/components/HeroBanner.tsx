import heroBannerImage from "@/assets/hero-banner.jpg";

export const HeroBanner = () => {
  return (
    <div className="relative w-full h-[50vh] md:h-[75vh] min-h-[400px] md:min-h-[600px] overflow-hidden">
      <img
        src={heroBannerImage}
        srcSet={`${heroBannerImage}?w=768 768w, ${heroBannerImage}?w=1024 1024w, ${heroBannerImage}?w=1920 1920w`}
        sizes="100vw"
        alt="Discover your next adventure - breathtaking travel destinations"
        className="w-full h-full object-cover object-center"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70" />
      
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