import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface SliderImage {
  url: string;
  caption?: string;
}

export interface ImageSliderProps {
  images: SliderImage[];
  autoplay?: boolean;
}

export default function ImageSlider({
  images,
  autoplay = true,
}: ImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  const total = images.length;

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || isPaused || total <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [autoplay, isPaused, next, total]);

  // Keyboard support
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [prev, next]);

  if (!images || total === 0) return null;

  return (
    <section
      ref={containerRef}
      aria-label="Image slider"
      className="relative w-full rounded-2xl overflow-hidden shadow-lg bg-[#0f1e30] outline-none focus:ring-2 focus:ring-blue-500 my-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
        touchStartX.current = null;
      }}
    >
      {/* Slides */}
      <div className="relative w-full h-56 sm:h-72 md:h-96">
        {images.map((img, i) => (
          <div
            key={`slide-${img.url}-${i}`}
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              opacity: i === current ? 1 : 0,
              zIndex: i === current ? 1 : 0,
            }}
            aria-hidden={i !== current}
          >
            <img
              src={img.url}
              alt={img.caption || `Slide ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {img.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                <p className="text-white text-sm font-medium drop-shadow">
                  {img.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-3 right-3 z-10 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
        {current + 1} / {total}
      </div>

      {/* Prev / Next arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors hidden sm:flex items-center justify-center"
            type="button"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors hidden sm:flex items-center justify-center"
            type="button"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
          {images.map((img, i) => (
            <button
              key={`dot-${img.url}-${i}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              type="button"
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-5 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
