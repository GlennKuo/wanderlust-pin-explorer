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
      { url: "https://images.pexels.com/photos/2082103/pexels-photo-2082103.jpeg", title: "Paris, France" },
      { url: "https://images.pexels.com/photos/1822605/pexels-photo-1822605.jpeg", title: "Tokyo, Japan" },
      { url: "https://images.pexels.com/photos/32715940/pexels-photo-32715940.jpeg", title: "New York, USA" },
      { url: "https://images.pexels.com/photos/31726431/pexels-photo-31726431.jpeg", title: "Sydney, Australia" },
    ],
    []
  );

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="relative h-[60vh] min-h-[220px] w-full overflow-hidden">
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
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [locationError, setLocationError] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [budget, setBudget] = useState("");
  const [preview, setPreview] = useState("");

  const canAddMore = pins.length < 3;
  const center = useMemo<LatLngLiteral>(() => ({ lat: 23.6978, lng: 120.9605 }), []);

  const handleAddPin = useCallback((pos: LatLngLiteral, name: string) => {
    setPins((prev) => (prev.length >= 3 ? prev : [...prev, { id: uid(), position: pos, name }]));
  }, []);
  
  const handleRemovePin = useCallback((id: string) => {
    setPins((prev) => prev.filter((p) => p.id !== id));
    if (selectedPin === id) {
      setSelectedPin(null);
    }
  }, [selectedPin]);

  const handleLocationChange = useCallback(async (value: string) => {
    setLocation(value);
    setLocationError("");
    
    const locations = value
      .split(",")
      .map(loc => loc.trim())
      .filter(loc => loc.length > 0);
    
    if (locations.length > 3) {
      setLocationError("Maximum 3 destinations allowed");
      return;
    }
    
    // Update pins based on typed locations
    if (locations.length > 0 && locations[locations.length - 1] !== "") {
      // For demo purposes, we'll just update the location string
      // In a real app, you'd geocode these locations to get coordinates
    }
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
      const marker = L.marker([p.position.lat, p.position.lng]);
      
      // Style selected pin differently
      if (selectedPin === p.id) {
        marker.setIcon(L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          className: 'selected-marker'
        }));
      }
      
      marker.on('click', () => {
        setSelectedPin(p.id);
      });
      
      marker.addTo(layer);
    });
  }, [pins, selectedPin]);

  // Sync location field with pins
  useEffect(() => {
    const locationNames = pins.map(p => p.name).join(", ");
    setLocation(locationNames);
  }, [pins]);

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
      <section className="mx-auto max-w-5xl px-4 pt-16 md:pt-20">
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
                className={`pointer-events-auto inline-flex items-center gap-2 rounded-full border backdrop-blur px-3 py-1 shadow cursor-pointer transition-colors ${
                  selectedPin === p.id 
                    ? 'bg-blue-100/90 border-blue-300' 
                    : 'bg-white/90 hover:bg-slate-50/90'
                }`}
                onClick={() => setSelectedPin(p.id)}
              >
                <span className={selectedPin === p.id ? "text-blue-500" : "text-rose-500"}>📍</span>
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
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2"><span>📍</span>Destinations</label>
              <input 
                type="text" 
                placeholder="Enter up to 3 destinations (comma-separated)" 
                className="w-full rounded-2xl border px-4 py-3 bg-slate-50" 
                value={location} 
                onChange={(e) => handleLocationChange(e.target.value)} 
              />
              {locationError && <p className="text-red-600 text-xs mt-1">{locationError}</p>}
              <p className="text-xs text-slate-500 mt-1">Click on map pins or type destinations separated by commas (max 3)</p>
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
            <button onClick={generate} disabled={!pins.length || !departDate || !returnDate || !validDates} className="w-full rounded-2xl bg-sky-300 hover:bg-sky-400 text-white py-4 font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
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

