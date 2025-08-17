import React, { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L, { LatLngLiteral } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths when bundling with Vite
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
(L.Marker.prototype as any).options.icon = DefaultIcon;

function ClickToAdd({ onAdd }: { onAdd: (pos: LatLngLiteral) => void }) {
  useMapEvents({
    click: (e) => {
      onAdd({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export const WorldMap: React.FC = () => {
  const [pins, setPins] = useState<LatLngLiteral[]>([]);
  const center = useMemo<LatLngLiteral>(() => ({ lat: 20, lng: 0 }), []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Choose Your Destination</h2>
        <p className="text-muted-foreground mt-1 text-sm">Click anywhere on the map to place a pin</p>
        <div className="mt-1 text-primary text-sm">
          {pins.length} destination{pins.length === 1 ? "" : "s"} selected
        </div>
      </div>

      <div className="relative rounded-2xl border shadow-travel bg-gradient-to-br from-primary/10 to-accent/10 p-2">
        <MapContainer
          center={center}
          zoom={2}
          scrollWheelZoom
          className="h-[440px] w-full rounded-xl overflow-hidden"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickToAdd onAdd={(pos) => setPins((prev) => [...prev, pos])} />

          {pins.map((pos, i) => (
            <Marker key={`${pos.lat}-${pos.lng}-${i}`} position={pos}>
              <Popup>
                Lat: {pos.lat.toFixed(5)}, Lng: {pos.lng.toFixed(5)}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};