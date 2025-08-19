import React, { useEffect, useMemo, useState } from "react";

/**
 * Revolut-style HERO with:
 * - Left oversized stacked headline
 * - Right glass/outlined card + floating pill
 * - Full-bleed background slideshow (fade cross-fade)
 *
 * Usage:
 * <HeroRevolutCarousel
 *   images={[
 *     { url: ".../paris.jpg", title: "Paris, France" },
 *     { url: ".../tokyo.jpg", title: "Tokyo, Japan" },
 *     { url: ".../nyc.jpg",   title: "New York, USA" },
 *   ]}
 *   intervalMs={5000}
 *   headline={["PLAN YOUR","JOURNEY"]}
 *   subcopy="Tell us your dates and budget — we’ll create the perfect itinerary."
 *   ctaLabel="Plan now"
 *   ctaHref="#plan" // 或 onCtaClick={() => ...}
 * />
 */

type Slide = { url: string; title?: string };

export default function HeroRevolutCarousel({
  images = [
    { url: "https://images.pexels.com/photos/2082103/pexels-photo-2082103.jpeg", title: "Paris, France" },
    { url: "https://images.pexels.com/photos/1822605/pexels-photo-1822605.jpeg", title: "Tokyo, Japan" },
    { url: "https://images.pexels.com/photos/32715940/pexels-photo-32715940.jpeg", title: "New York, USA" },
    { url: "https://images.pexels.com/photos/31726431/pexels-photo-31726431.jpeg", title: "Sydney, Australia" }
  ],
  intervalMs = 5000,
  headline = ["PLAN YOUR", "JOURNEY"],
  subcopy = "Tell us your dates and budget — we’ll create the perfect itinerary.",
  ctaLabel = "Plan now",
  ctaHref,
  onCtaClick,
}: {
  images?: Slide[];
  intervalMs?: number;
  headline?: string[];
  subcopy?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
}) {
  const slides = useMemo(() => images.filter(Boolean), [images]);
  const [idx, setIdx] = useState(0);

  // autoplay
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  const current = slides[idx] ?? slides[0];

  return (
    <section className="relative isolate w-full min-h-[86vh] overflow-hidden">
      {/* Background slideshow */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <img
            key={s.url}
            src={s.url}
            alt={s.title ?? `slide-${i + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === idx ? "opacity-100" : "opacity-0"
            }`}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
        {/* soft sky overlay to keep text legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200/50 via-sky-100/20 to-black/30" />
      </div>

      {/* Top-left showcasing pill, fixed like your original */}
      <div className="absolute left-4 top-4 z-20">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white shadow-lg backdrop-blur">
          <span className="inline-block h-2 w-2 rounded-full bg-lime-300" />
          <span>Showcasing: {current?.title ?? "—"}</span>
        </div>
      </div>

      {/* Content grid */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-12 items-center gap-8 px-4 pt-20 sm:px-6 md:pt-24 lg:pt-28 xl:gap-12">
        {/* Left: huge stacked headline like Revolut */}
        <div className="col-span-12 lg:col-span-6 lg:pr-4">
          <h1 className="font-black leading-[0.9] tracking-tight text-white text-[13vw] xs:text-[11vw] sm:text-7xl md:text-8xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
            {headline.map((line, i) => (
              <span key={i} className={`uppercase ${i === 0 ? 'inline' : 'block'}`}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-4 max-w-lg text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 leading-relaxed">{subcopy}</p>

          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {ctaHref ? (
              <a
                href={ctaHref}
                className="rounded-2xl bg-black px-6 py-3 text-white shadow-lg shadow-black/20 transition-transform hover:scale-[1.02] active:scale-[0.98] text-sm font-medium"
              >
                {ctaLabel}
              </a>
            ) : (
              <button
                onClick={onCtaClick}
                className="rounded-2xl bg-black px-6 py-3 text-white shadow-lg shadow-black/20 transition-transform hover:scale-[1.02] active:scale-[0.98] text-sm font-medium"
              >
                {ctaLabel}
              </button>
            )}

            {/* optional secondary link */}
            <a
              href="#itinerary"
              className="text-xs sm:text-sm font-medium text-white/90 underline decoration-white/40 underline-offset-4 hover:text-white"
            >
              See sample itinerary
            </a>
          </div>
        </div>

        {/* Right: Glass/outlined card + floating pill */}
        <div className="relative col-span-12 h-[48vh] min-h-[320px] lg:col-span-6 lg:h-[52vh] lg:min-h-[360px] mt-8 lg:mt-0">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative h-[48vh] w-[85vw] max-w-[520px] lg:h-[52vh] lg:w-[28vw] lg:max-w-[580px] rounded-[28px] lg:rounded-[32px] border-2 border-white/70 bg-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              {/* inner sheen */}
              <div className="pointer-events-none absolute inset-0 rounded-[26px] lg:rounded-[30px] bg-gradient-to-b from-white/40 via-white/15 to-white/10" />

              {/* center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <span className="text-xs lg:text-sm font-medium uppercase tracking-wide text-white/80">Personal</span>
                <div className="mt-2 text-3xl lg:text-4xl xl:text-5xl font-extrabold tabular-nums text-white">$ 6,012</div>
                <button className="mt-4 lg:mt-5 rounded-full bg-white/90 px-4 lg:px-5 py-2 text-xs lg:text-sm font-semibold text-black shadow-sm transition hover:bg-white">
                  Accounts
                </button>
              </div>

              {/* floating pill at bottom */}
              <div className="absolute bottom-4 lg:bottom-5 left-1/2 w-[90%] lg:w-[85%] -translate-x-1/2">
                <div className="mx-auto flex items-center gap-2 lg:gap-3 rounded-xl lg:rounded-2xl bg-white px-3 lg:px-4 py-2 lg:py-3 shadow-xl">
                  <div className="h-6 w-6 lg:h-8 lg:w-8 shrink-0 rounded-full bg-black/90" />
                  <div className="flex w-full items-baseline justify-between">
                    <div>
                      <div className="text-xs lg:text-sm font-semibold text-black">Salary</div>
                      <div className="text-[10px] lg:text-xs text-black/60">Today, 11:28</div>
                    </div>
                    <div className="text-xs lg:text-sm font-semibold text-emerald-600">+2,550</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
