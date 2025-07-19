import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Pin {
  id: string;
  lat: number;
  lng: number;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const WorldMap = () => {
  const [pins, setPins] = useState<Pin[]>([]);

  const handleMapClick = (lat: number, lng: number) => {
    const newPin: Pin = {
      id: Date.now().toString(),
      lat,
      lng,
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

      <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl overflow-hidden shadow-travel" style={{ height: '400px' }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {pins.map((pin) => (
            <Marker key={pin.id} position={[pin.lat, pin.lng]}>
              <Popup>
                <div className="text-center">
                  <p className="font-medium">Coordinates:</p>
                  <p className="text-sm">Lat: {pin.lat.toFixed(4)}</p>
                  <p className="text-sm">Lng: {pin.lng.toFixed(4)}</p>
                  <button
                    onClick={() => removePin(pin.id)}
                    className="mt-2 text-destructive hover:text-destructive/80 text-sm"
                  >
                    Remove Pin
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Pin legend */}
        {pins.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 bg-background/90 backdrop-blur-sm rounded-lg p-3">
            {pins.map((pin) => (
              <div
                key={pin.id}
                className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 shadow-sm border border-border"
              >
                <MapPin className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium">
                  {pin.lat.toFixed(2)}, {pin.lng.toFixed(2)}
                </span>
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