import { useState } from "react";
import { MapPin } from "lucide-react";

interface Pin {
  id: string;
  x: number;
  y: number;
  country: string;
}

export const WorldMap = () => {
  const [pins, setPins] = useState<Pin[]>([]);

  const handleMapClick = (event: React.MouseEvent<SVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Simple country detection based on coordinates (rough approximation)
    const getCountryFromCoordinates = (x: number, y: number): string => {
      if (x > 15 && x < 35 && y > 15 && y < 45) return "Europe";
      if (x > 5 && x < 25 && y > 45 && y < 85) return "Africa";
      if (x > 35 && x < 75 && y > 15 && y < 60) return "Asia";
      if (x > 75 && x < 85 && y > 25 && y < 55) return "Japan";
      if (x > 85 && x < 95 && y > 50 && y < 85) return "Australia";
      if (x > 12 && x < 35 && y > 10 && y < 50) return "North America";
      if (x > 20 && x < 40 && y > 60 && y < 90) return "South America";
      return "Unknown Location";
    };

    const country = getCountryFromCoordinates(x, y);
    const newPin: Pin = {
      id: Date.now().toString(),
      x,
      y,
      country,
    };

    setPins(prev => [...prev, newPin]);
  };

  const removePin = (id: string) => {
    setPins(prev => prev.filter(pin => pin.id !== id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Choose Your Destination
        </h2>
        <p className="text-muted-foreground">
          Click anywhere on the map to place a pin for your dream destination
        </p>
        {pins.length > 0 && (
          <p className="text-sm text-primary mt-2">
            {pins.length} destination{pins.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 shadow-travel">
        <svg
          viewBox="0 0 100 60"
          className="w-full h-auto cursor-crosshair"
          onClick={handleMapClick}
        >
          {/* Simple world map silhouette */}
          {/* North America */}
          <path
            d="M8 15 Q12 12 18 15 L22 18 Q25 20 28 25 L30 30 Q28 35 25 38 L20 40 Q15 38 12 35 L10 30 Q8 25 8 20 Z"
            fill="hsl(var(--primary))"
            opacity="0.6"
            className="hover:opacity-80 transition-opacity"
          />
          
          {/* South America */}
          <path
            d="M20 45 Q23 42 26 45 L28 50 Q30 60 28 70 L25 75 Q22 78 20 75 L18 70 Q16 60 18 50 Q19 47 20 45 Z"
            fill="hsl(var(--primary))"
            opacity="0.6"
            className="hover:opacity-80 transition-opacity"
          />
          
          {/* Europe */}
          <path
            d="M35 18 Q40 15 45 18 L48 22 Q47 28 45 30 L42 32 Q38 30 36 28 L35 25 Q34 20 35 18 Z"
            fill="hsl(var(--secondary))"
            opacity="0.7"
            className="hover:opacity-90 transition-opacity"
          />
          
          {/* Africa */}
          <path
            d="M35 35 Q40 32 45 35 L48 40 Q50 50 48 60 L45 65 Q40 68 35 65 L32 60 Q30 50 32 40 Q33 37 35 35 Z"
            fill="hsl(var(--accent))"
            opacity="0.6"
            className="hover:opacity-80 transition-opacity"
          />
          
          {/* Asia */}
          <path
            d="M50 20 Q60 15 70 20 L75 25 Q78 35 75 40 L70 45 Q60 42 55 38 L52 35 Q50 30 50 25 Q49 22 50 20 Z"
            fill="hsl(var(--primary))"
            opacity="0.6"
            className="hover:opacity-80 transition-opacity"
          />
          
          {/* Australia */}
          <path
            d="M65 48 Q70 45 75 48 L78 52 Q77 58 75 60 L70 62 Q65 60 63 58 L62 55 Q62 50 65 48 Z"
            fill="hsl(var(--secondary))"
            opacity="0.7"
            className="hover:opacity-90 transition-opacity"
          />

          {/* Ocean decoration */}
          <circle cx="15" cy="40" r="1" fill="hsl(var(--primary))" opacity="0.3" />
          <circle cx="60" cy="45" r="1" fill="hsl(var(--primary))" opacity="0.3" />
          <circle cx="80" cy="35" r="1" fill="hsl(var(--primary))" opacity="0.3" />

          {/* Render pins */}
          {pins.map((pin) => (
            <g key={pin.id}>
              <circle
                cx={pin.x}
                cy={pin.y}
                r="1.5"
                fill="hsl(var(--destructive))"
                className="animate-pin-bounce cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  removePin(pin.id);
                }}
              />
              <circle
                cx={pin.x}
                cy={pin.y}
                r="0.5"
                fill="white"
                className="animate-pin-bounce cursor-pointer"
                style={{ animationDelay: "0.1s" }}
                onClick={(e) => {
                  e.stopPropagation();
                  removePin(pin.id);
                }}
              />
            </g>
          ))}
        </svg>

        {/* Pin legend */}
        {pins.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {pins.map((pin) => (
              <div
                key={pin.id}
                className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 shadow-sm border border-border"
              >
                <MapPin className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium">{pin.country}</span>
                <button
                  onClick={() => removePin(pin.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};