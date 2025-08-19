import React, { useEffect, useMemo, useRef, useState } from "react";
import L, { LatLngLiteral, Map as LeafletMap, LayerGroup } from "leaflet";
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

export const WorldMap: React.FC = () => {
  const [pins, setPins] = useState<LatLngLiteral[]>([]);
  const center = useMemo<LatLngLiteral>(() => ({ lat: 20, lng: 0 }), []);

  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    const map = L.map(mapElRef.current, {
      center: [center.lat, center.lng],
      zoom: 2,
      scrollWheelZoom: true,
      worldCopyJump: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      crossOrigin: true,
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    markersRef.current = group;

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setPins((prev) => [...prev, { lat, lng }]);
    });

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, [center]);

  // Render markers imperatively when pins change
  useEffect(() => {
    const group = markersRef.current;
    const map = mapRef.current;
    if (!group || !map) return;

    group.clearLayers();
    pins.forEach((pos) => {
      L.marker([pos.lat, pos.lng]).addTo(group).bindPopup(
        `Lat: ${pos.lat.toFixed(5)}, Lng: ${pos.lng.toFixed(5)}`
      );
    });
  }, [pins]);

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
        <div ref={mapElRef} className="h-[440px] w-full rounded-xl overflow-hidden" />
      </div>
    </div>
  );
};