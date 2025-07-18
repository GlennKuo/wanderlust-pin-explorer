import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const landmarks = [
  {
    id: 1,
    name: "Mountain Landscapes",
    image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1600&h=800&fit=crop",
    location: "Rocky Mountains"
  },
  {
    id: 2,
    name: "Misty Peaks",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&h=800&fit=crop",
    location: "Foggy Summit"
  },
  {
    id: 3,
    name: "River Valley",
    image: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=1600&h=800&fit=crop",
    location: "Mountain River"
  },
  {
    id: 4,
    name: "Golden Hour",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&h=800&fit=crop",
    location: "Sunset Peak"
  },
  {
    id: 5,
    name: "Starry Night",
    image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=1600&h=800&fit=crop",
    location: "Night Sky"
  }
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % landmarks.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      <Carousel className="w-full h-full">
        <CarouselContent className="h-full">
          {landmarks.map((landmark, index) => (
            <CarouselItem key={landmark.id} className="p-0 h-full">
              <div 
                className={`relative w-full h-full transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              >
                <div 
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${landmark.image})` }}
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
                    <div className="text-sm md:text-base opacity-75">
                      📍 {landmark.location}
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {landmarks.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-110' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};