import React, { useEffect, useMemo, useRef } from "react";
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

type WorldMapProps = {
  pins: LatLngLiteral[];
  onPinsChange: React.Dispatch<React.SetStateAction<LatLngLiteral[]>>;
  selectedPin: LatLngLiteral | null;
  onSelectedPinChange: React.Dispatch<React.SetStateAction<LatLngLiteral | null>>;
};

export const WorldMap: React.FC<WorldMapProps> = ({ pins, onPinsChange, selectedPin, onSelectedPinChange }) => {
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
      attribution: '',  // Remove default attribution to handle it separately
      crossOrigin: true,
    }).addTo(map);

    // Disable default attribution control
    map.attributionControl.remove();

    const group = L.layerGroup().addTo(map);
    markersRef.current = group;

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const newPin = { lat, lng };
      onPinsChange((prev) => [...prev, newPin]);
      onSelectedPinChange(newPin);
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
      const isSelected = selectedPin && selectedPin.lat === pos.lat && selectedPin.lng === pos.lng;
      
      // Create custom marker icon based on selection state
      const markerIcon = L.divIcon({
        html: `<div class="w-6 h-6 rounded-full border-3 border-white shadow-lg cursor-pointer ${
          isSelected ? 'bg-blue-500' : 'bg-red-500'
        } hover:scale-110 transition-transform"></div>`,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([pos.lat, pos.lng], {
        icon: markerIcon,
        zIndexOffset: 1000
      }).addTo(group).bindPopup(
        `Lat: ${pos.lat.toFixed(5)}, Lng: ${pos.lng.toFixed(5)}`
      );
      
      // Handle marker click to select
      marker.on('click', () => {
        onSelectedPinChange(pos);
      });
      
      // Set high z-index for marker element
      const markerElement = marker.getElement();
      if (markerElement) {
        markerElement.style.zIndex = '1000';
      }
    });
  }, [pins, selectedPin, onSelectedPinChange]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Instruction Label */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          You can select up to 3 cities
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Choose Your Destination</h2>
        <p className="text-muted-foreground mt-1 text-sm">Click anywhere on the map to place a pin</p>
        <div className="mt-1 text-primary text-sm">
          {pins.length} destination{pins.length === 1 ? "" : "s"} selected
        </div>
      </div>

      <div className="relative rounded-2xl border shadow-travel bg-gradient-to-br from-primary/10 to-accent/10 p-2">
        <div ref={mapElRef} className="h-[440px] w-full rounded-xl overflow-hidden" style={{ zIndex: 1 }} />
        
        {/* Custom Attribution/Legend Overlay */}
        <div className="absolute bottom-4 right-4 z-[9999] bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 shadow-lg pointer-events-none">
          <div className="flex items-center gap-2">
            <span>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline pointer-events-auto">OpenStreetMap</a></span>
            <span>•</span>
            <span>🌍 <a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline pointer-events-auto">Leaflet</a></span>
          </div>
        </div>
      </div>
    </div>
  );
};