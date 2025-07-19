import { useState, useRef } from "react";
import { MapPin } from "lucide-react";

interface MarkerData {
  id: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
}

export const WorldMap = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Convert pixel coordinates to approximate lat/lng
  const pixelToLatLng = (x: number, y: number) => {
    // Simple mercator projection approximation
    const lat = 85.0511 - (y / 100) * 170.1022;
    const lng = (x / 100) * 360 - 180;
    return { lat: Math.round(lat * 1000000) / 1000000, lng: Math.round(lng * 1000000) / 1000000 };
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    const { lat, lng } = pixelToLatLng(x, y);
    
    const newMarker: MarkerData = {
      id: Date.now().toString(),
      x,
      y,
      lat,
      lng,
    };
    
    setMarkers(prev => [...prev, newMarker]);
  };

  const removeMarker = (id: string) => {
    setMarkers(prev => prev.filter(marker => marker.id !== id));
  };

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* World Map Background */}
      <div
        ref={mapRef}
        className="w-full h-full cursor-crosshair relative"
        onClick={handleMapClick}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 500' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1000' height='500' fill='%23E3F2FD'/%3E%3C!-- World continents --%3E%3Cpath d='M80 150 Q120 120 180 150 L220 180 Q250 200 280 250 L300 300 Q280 350 250 380 L200 400 Q150 380 120 350 L100 300 Q80 250 80 200 Z' fill='%23388E3C' opacity='0.8'/%3E%3Cpath d='M200 450 Q230 420 260 450 L280 500 Q300 600 280 700 L250 750 Q220 780 200 750 L180 700 Q160 600 180 500 Q190 470 200 450 Z' fill='%23388E3C' opacity='0.8'/%3E%3Cpath d='M350 180 Q400 150 450 180 L480 220 Q470 280 450 300 L420 320 Q380 300 360 280 L350 250 Q340 200 350 180 Z' fill='%232E7D32' opacity='0.9'/%3E%3Cpath d='M350 350 Q400 320 450 350 L480 400 Q500 500 480 600 L450 650 Q400 680 350 650 L320 600 Q300 500 320 400 Q330 370 350 350 Z' fill='%2366BB6A' opacity='0.8'/%3E%3Cpath d='M500 200 Q600 150 700 200 L750 250 Q780 350 750 400 L700 450 Q600 420 550 380 L520 350 Q500 300 500 250 Q490 220 500 200 Z' fill='%23388E3C' opacity='0.8'/%3E%3Cpath d='M650 480 Q700 450 750 480 L780 520 Q770 580 750 600 L700 620 Q650 600 630 580 L620 550 Q620 500 650 480 Z' fill='%232E7D32' opacity='0.9'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Grid overlay for better visual reference */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            {/* Latitude lines */}
            {[...Array(9)].map((_, i) => (
              <line
                key={`lat-${i}`}
                x1="0"
                y1={`${(i + 1) * 10}%`}
                x2="100%"
                y2={`${(i + 1) * 10}%`}
                stroke="currentColor"
                strokeWidth="0.5"
              />
            ))}
            {/* Longitude lines */}
            {[...Array(17)].map((_, i) => (
              <line
                key={`lng-${i}`}
                x1={`${(i + 1) * 5.55}%`}
                y1="0"
                x2={`${(i + 1) * 5.55}%`}
                y2="100%"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            ))}
          </svg>
        </div>

        {/* Markers */}
        {markers.map((marker) => (
          <div
            key={marker.id}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group"
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              removeMarker(marker.id);
            }}
          >
            <MapPin className="w-6 h-6 text-red-500 drop-shadow-lg animate-bounce" />
            
            {/* Popup */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-white text-gray-800 text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-200 whitespace-nowrap">
                <div className="font-semibold">Location:</div>
                <div>Lat: {marker.lat}°</div>
                <div>Lng: {marker.lng}°</div>
                <div className="text-gray-500 mt-1">Click to remove</div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
        <h3 className="font-semibold text-gray-800 mb-2">Interactive World Map</h3>
        <p className="text-sm text-gray-600 mb-2">
          Click anywhere on the map to place a marker and see coordinates.
        </p>
        {markers.length > 0 && (
          <p className="text-xs text-blue-600">
            {markers.length} marker{markers.length > 1 ? 's' : ''} placed
          </p>
        )}
      </div>
    </div>
  );
};