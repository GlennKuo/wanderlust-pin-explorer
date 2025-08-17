import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
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

// -------------------------------------------------------------
// Map Click Handler
// -------------------------------------------------------------
function ClickToAddPin({ canAdd, onAdd }: { canAdd: boolean; onAdd: (pos: LatLngLiteral, resolvedName: string) => void }) {
  useMapEvents({
    click: async (e) => {
      if (!canAdd) return;
      const { lat, lng } = e.latlng;
      const name = await reverseGeocode(lat, lng);
      onAdd({ lat, lng }, name);
    },
  });
  return null;
}

// -------------------------------------------------------------
// Main
// -------------------------------------------------------------
export default function App() {
  const [pins, setPins] = useState<TripPin[]>([]);
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [budget, setBudget] = useState("");
  const [preview, setPreview] = useState("");

  const canAddMore = pins.length < 3;
  const center = useMemo<LatLngLiteral>(() => ({ lat: 23.6978, lng: 120.9605 }), []);

  const handleAddPin = useCallback((pos: LatLngLiteral, name: string) => {
    setPins((prev) => (prev.length >= 3 ? prev : [...prev, { id: uid(), position: pos, name }]));
  }, []);
  const handleRemovePin = useCallback((id: string) => setPins((prev) => prev.filter((p) => p.id !== id)), []);

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
          <MapContainer center={center} zoom={3} scrollWheelZoom className="h-[440px] w-full">
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickToAddPin canAdd={canAddMore} onAdd={(pos, name) => handleAddPin(pos, name)} />
            {pins.map((p) => (
              <Marker key={p.id} position={p.position} />
            ))}
          </MapContainer>

        {/* chips overlay */}
          <div className="pointer-events-none absolute left-3 bottom-3 flex flex-wrap gap-2">
            {pins.map((p) => (
              <div key={p.id} className="pointer-events-auto inline-flex items-center gap-2 rounded-full border bg-white/90 backdrop-blur px-3 py-1 shadow">
                <span className="text-rose-500">📍</span>
                <span className="text-sm font-medium">{p.name}</span>
                <button onClick={() => handleRemovePin(p.id)} className="ml-1 text-slate-500 hover:text-rose-600">×</button>
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

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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

