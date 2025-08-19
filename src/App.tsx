import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L, { LatLngLiteral } from "leaflet";
import "leaflet/dist/leaflet.css";

// -------------------------------------------------------------
// Leaflet default icon fix for Vite
// -------------------------------------------------------------
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
(L.Marker.prototype as any).options.icon = DefaultIcon;

// -------------------------------------------------------------
// Types
// -------------------------------------------------------------
export type TripPin = {
  id: string;
  position: LatLngLiteral;
  name: string; // 城市或地名（只抓名稱）
};

// -------------------------------------------------------------
// Banner（簡約輪播，避免 Tailwind 自訂時長語法造成警告）
// -------------------------------------------------------------
function BannerCarousel() {
  const images = useMemo(
    () => [
      { url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1920&auto=format&fit=crop", title: "Paris, France" },
      { url: "https://images.unsplash.com/photo-1473959920023-1f462a5f0e51?q=80&w=1920&auto=format&fit=crop", title: "Tokyo, Japan" },
      { url: "https://images.unsplash.com/photo-1488747279002-c8523379faaa?q=80&w=1920&auto=format&fit=crop", title: "New York, USA" },
      { url: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1920&auto=format&fit=crop", title: "Sydney, Australia" },
    ],
    []
  );

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="relative h-[34vh] min-h-[220px] w-full overflow-hidden">
      {/* 疊放全部圖片，用透明度切換避免布局跳動 */}
      {images.map((img, i) => (
        <img
          key={img.url}
          src={img.url}
          alt={img.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"}`}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* 漸層疊層，讓文字更清楚 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/40" />

      {/* 文字移到左上角 */}
      <div className="absolute left-0 top-0 px-4 pt-6">
        <div className="mx-auto max-w-6xl text-white">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Plan Your Journey</h1>
          <p className="text-sm md:text-base opacity-90 mt-1">
            Tell us your dates and budget, and we'll create the perfect itinerary.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-lime-300" />
            <span>Showcasing: {images[idx].title}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Utilities
// -------------------------------------------------------------
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("zoom", "10");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), { headers: { "Accept-Language": "zh-TW,en" } });
    const data = await res.json();
    const a = data?.address ?? {};
    const name = a.city || a.town || a.village || a.municipality || a.state || a.country || data?.name || "Unknown Location";
    return String(name);
  } catch {
    return "Unknown Location";
  }
}
const uid = () => Math.random().toString(36).slice(2, 9);

// (Removed react-leaflet ClickToAddPin; using pure Leaflet click handler in useEffect)

// -------------------------------------------------------------
// Main
// -------------------------------------------------------------
export default function App() {
  const [pins, setPins] = useState<TripPin[]>([]);
  const [selectedPin, setSelectedPin] = useState<TripPin | null>(null);
  const [location, setLocation] = useState("");
  const [locationError, setLocationError] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [budget, setBudget] = useState("");
  const [preview, setPreview] = useState("");

  // Geocoding utility function
  const geocodeLocation = useCallback(async (locationName: string): Promise<LatLngLiteral | null> => {
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("q", locationName.trim());
      url.searchParams.set("limit", "1");
      
      const res = await fetch(url.toString(), { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Parse comma-separated locations and validate
  const parseLocations = useCallback((value: string) => {
    const locations = value.split(',').map(loc => loc.trim()).filter(loc => loc.length > 0);
    
    if (locations.length > 3) {
      setLocationError("Maximum 3 destinations allowed");
      return { isValid: false, locations };
    }
    
    setLocationError("");
    return { isValid: true, locations };
  }, []);

  // Sync location field with pins
  const syncLocationWithPins = useCallback(() => {
    const locationValue = pins.map(pin => pin.name).join(', ');
    setLocation(locationValue);
    setSelectedPin(null); // Clear selection when syncing multiple pins
  }, []);

  // Handle location input changes
  const handleLocationChange = useCallback(async (value: string) => {
    setLocation(value);
    
    const { isValid, locations } = parseLocations(value);
    
    if (!isValid) return;
    
    // If we have fewer locations than pins, remove excess pins
    if (locations.length < pins.length) {
      const newPins = pins.slice(0, locations.length);
      setPins(newPins);
      setSelectedPin(null);
    }
    
    // Update existing pins or add new ones
    const updatedPins: TripPin[] = [];
    
    for (let i = 0; i < locations.length; i++) {
      const locationName = locations[i];
      const existingPin = pins[i];
      
      if (existingPin) {
        // Update existing pin name
        updatedPins.push({ ...existingPin, name: locationName });
      } else {
        // Try to geocode and add new pin
        const coords = await geocodeLocation(locationName);
        if (coords) {
          updatedPins.push({
            id: uid(),
            position: coords,
            name: locationName
          });
        }
      }
    }
    
    setPins(updatedPins);
  }, [pins, parseLocations, geocodeLocation]);
  
  const canAddMore = pins.length < 3;

  // Sync location field when pins change (from map clicks)
  useEffect(() => {
    if (!selectedPin) {
      syncLocationWithPins();
    }
  }, [pins, selectedPin, syncLocationWithPins]);

  const center = useMemo<LatLngLiteral>(() => ({ lat: 23.6978, lng: 120.9605 }), []);

  const handleAddPin = useCallback((pos: LatLngLiteral, name: string) => {
    const newPin = { id: uid(), position: pos, name };
    setPins((prev) => (prev.length >= 3 ? prev : [...prev, newPin]));
    // Auto-select the newly added pin
    setSelectedPin(newPin);
  }, []);
  const handleRemovePin = useCallback((id: string) => {
    setPins((prev) => prev.filter((p) => p.id !== id));
    setSelectedPin((current) => current?.id === id ? null : current);
  }, []);

  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const map = L.map(mapElRef.current).setView([center.lat, center.lng], 3);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    markersLayerRef.current = layer;

    map.on("click", async (e: any) => {
      if (!canAddMore) return;
      const { lat, lng } = e.latlng;
      const name = await reverseGeocode(lat, lng);
      handleAddPin({ lat, lng }, name);
    });

    mapRef.current = map;
    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, [center, canAddMore, handleAddPin]);

  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    pins.forEach((p) => {
      const isSelected = selectedPin?.id === p.id;
      
      // Create custom marker with selection state
      const markerIcon = L.divIcon({
        html: `<div class="w-6 h-6 rounded-full border-3 border-white shadow-lg cursor-pointer ${
          isSelected ? 'bg-blue-500' : 'bg-red-500'
        } hover:scale-110 transition-transform"></div>`,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([p.position.lat, p.position.lng], {
        icon: markerIcon,
        zIndexOffset: 1000
      }).addTo(layer);
      
      // Handle marker click to select
      marker.on('click', () => {
        setSelectedPin(p);
      });
    });
  }, [pins, selectedPin]);

  const validDates = useMemo(() => (!departDate || !returnDate ? true : new Date(departDate) <= new Date(returnDate)), [departDate, returnDate]);

  const generate = useCallback(() => {
    const cities = pins.map((p) => p.name);
    const days = (() => {
      if (!departDate || !returnDate) return 0;
      const ms = Math.max(0, new Date(returnDate).getTime() - new Date(departDate).getTime());
      return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
    })();
    const headline = cities.length ? `Itinerary: ${cities.join(" → ")}` : "Itinerary";
    const blurb = `• Destinations: ${cities.length ? cities.join(", ") : "—"}\n• Dates: ${departDate || "—"} → ${returnDate || "—"} (${days} days)\n• Budget: ${budget ? `$ ${Number(budget).toLocaleString()}` : "—"}`;
    setPreview(`${headline}\n\n${blurb}\n\n(LLM output placeholder — connect your backend API here.)`);
  }, [pins, departDate, returnDate, budget]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#eaf3ff] via-[#f7fbff] to-[#e6f1ff] text-slate-800">
      <BannerCarousel />

      {/* Map block — ABOVE planner */}
      <section className="mx-auto max-w-5xl px-4 -mt-16 md:-mt-20">
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-semibold">Choose Your Destination</h3>
          <p className="text-slate-500 mt-1 text-sm">Click anywhere on the map to place a pin for your dream destination</p>
          <div className="mt-1 text-sky-600 text-sm">{pins.length} destination{pins.length === 1 ? "" : "s"} selected</div>
        </div>

        <div className="relative mt-6 rounded-3xl overflow-hidden border shadow-lg bg-gradient-to-br from-sky-50 via-white to-amber-50">
          <div ref={mapElRef} className="h-[440px] w-full" aria-label="Interactive world map" />

        {/* chips overlay */}
          <div className="pointer-events-none absolute left-3 bottom-3 flex flex-wrap gap-2">
            {pins.map((p) => (
              <div 
                key={p.id} 
                className={`pointer-events-auto inline-flex items-center gap-2 rounded-full border backdrop-blur px-3 py-1 shadow cursor-pointer transition-all ${
                  selectedPin?.id === p.id 
                    ? 'bg-blue-100/90 border-blue-300' 
                    : 'bg-white/90 border-gray-200 hover:bg-gray-50/90'
                }`}
                onClick={() => setSelectedPin(p)}
              >
                <span className="text-rose-500">📍</span>
                <span className="text-sm font-medium">{p.name}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePin(p.id);
                  }} 
                  className="ml-1 text-slate-500 hover:text-rose-600"
                >×</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planner card — BELOW map */}
      <section className="mx-auto max-w-4xl px-4 mt-10 md:mt-14">
        <div className="rounded-3xl border bg-white/90 backdrop-blur shadow-xl p-6 md:p-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Plan Your Journey</h2>
          <p className="text-center text-slate-500 mt-2">Tell us your dates and budget, and we'll create the perfect itinerary</p>

          <div className="mt-6 space-y-4">
            {/* Location Input */}
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <span>📍</span>Destinations (up to 3)
              </label>
              <input 
                type="text"
                placeholder="Enter destinations separated by commas (e.g., Paris, Tokyo, New York)"
                value={selectedPin ? selectedPin.name : location}
                onChange={(e) => {
                  if (selectedPin) {
                    // Update the selected pin's name only
                    setPins(prev => prev.map(p => 
                      p.id === selectedPin.id ? { ...p, name: e.target.value } : p
                    ));
                    setSelectedPin(prev => prev ? { ...prev, name: e.target.value } : null);
                  } else {
                    // Handle comma-separated input
                    handleLocationChange(e.target.value);
                  }
                }}
                className={`w-full rounded-2xl border px-4 py-3 bg-slate-50 ${
                  locationError ? 'border-red-400 focus:border-red-500' : ''
                }`}
              />
              
              {/* Status indicators */}
              <div className="space-y-1">
                {selectedPin && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Editing selected map pin
                  </div>
                )}
                
                {!selectedPin && pins.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {pins.length} destination{pins.length === 1 ? '' : 's'} from map pins
                  </div>
                )}
                
                {locationError && (
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    {locationError}
                  </div>
                )}
                
                <div className="text-xs text-slate-400">
                  Tip: Click map pins to edit individual destinations, or type here for bulk entry
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-2"><span>📅</span>Departure Date</label>
                <input type="date" className="w-full rounded-2xl border px-4 py-3 bg-slate-50" value={departDate} onChange={(e) => setDepartDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-2"><span>📅</span>Return Date</label>
                <input type="date" className="w-full rounded-2xl border px-4 py-3 bg-slate-50" value={returnDate} min={departDate || undefined} onChange={(e) => setReturnDate(e.target.value)} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium flex items-center gap-2"><span>💲</span>Budget (USD)</label>
                <input type="number" min={0} placeholder="Enter your budget" inputMode="numeric" className="w-full rounded-2xl border px-4 py-3 bg-slate-50" value={budget} onChange={(e) => setBudget(e.target.value)} />
                <p className="text-xs text-slate-500 mt-1">Budget includes flights, accommodation & activities</p>
              </div>
            </div>
          </div>

          {!validDates && <div className="text-red-600 text-sm mt-3">Return date must be after departure date.</div>}

          <div className="mt-6">
            <button 
              onClick={generate} 
              disabled={!pins.length || !departDate || !returnDate || !validDates || !!locationError} 
              className="w-full rounded-2xl bg-sky-300 hover:bg-sky-400 text-white py-4 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ✈️  Generate My Trip
            </button>
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="mx-auto max-w-5xl px-4 mt-10 md:mt-14 mb-16">
        <div className="rounded-3xl border bg-white/90 backdrop-blur shadow p-5 md:p-6">
          <h3 className="text-xl font-semibold">Itinerary Preview</h3>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{preview || "After clicking Generate, your itinerary preview will appear here (stub)."}</pre>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Wanderlust — UI demo. Map: OpenStreetMap + Leaflet.
      </footer>
    </div>
  );
}

