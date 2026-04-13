"use client";

import { useEffect, useMemo, useState } from "react";

export function HeroSection({ items = [] }) {
  const slides = useMemo(() => items.filter(Boolean), [items]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeIndex = slides.length > 0 ? currentIndex % slides.length : 0;

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const item = slides[activeIndex] ?? null;

  if (!item) {
    return (
      <section className="relative min-h-[60vh] px-4 pt-28 pb-14 sm:px-8 sm:pt-32">
        <div className="mx-auto w-full max-w-7xl rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-8">
          <p className="text-zinc-300">Konten unggulan belum tersedia.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[78vh] overflow-hidden bg-linear-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-4 pt-24 pb-16 sm:px-8 sm:pt-28">
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={`${slide.id}-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
            style={
              slide.backdropUrl
                ? {
                    backgroundImage: `url('${slide.backdropUrl}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center 20%",
                  }
                : undefined
            }
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(92deg,rgba(5,6,10,0.86)_8%,rgba(5,6,10,0.44)_46%,rgba(5,6,10,0.84)_96%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(6,7,11,1)_0%,rgba(6,7,11,0.22)_35%,rgba(6,7,11,0)_65%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-end gap-4 pt-16 sm:pt-20">
        <p className="inline-block w-fit rounded bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          {item.contentType === "movie" ? "Movie" : "TV Series"}
        </p>

        <p className="italic text-zinc-300">May God have mercy.</p>

        <h1 className="max-w-3xl text-5xl font-light leading-[0.95] text-white sm:text-7xl">
          {item.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-200 sm:text-sm">
          <span className="font-bold text-yellow-300">★ {item.rating ?? "8.0"}</span>
          {item.year ? <span>{item.year}</span> : null}
          {item.seasons ? <span>{`${item.seasons} Seasons`}</span> : null}
          {item.country ? <span>{item.country}</span> : null}
          {item.label ? <span>{item.label}</span> : null}
          {item.status ? (
            <span className="rounded bg-green-700/70 px-2 py-0.5 text-[11px] font-semibold text-green-200">
              {item.status === "Returning Series" ? "ONGOING" : item.status}
            </span>
          ) : null}
        </div>

        <p className="max-w-2xl text-sm leading-relaxed text-zinc-200 sm:text-base">
          {item.overview}
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href={item.trailerUrl ?? "#"}
            target={item.trailerUrl ? "_blank" : undefined}
            rel={item.trailerUrl ? "noreferrer" : undefined}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-500"
          >
            <span>▷</span>
            <span>Watch Now</span>
          </a>
        </div>

        <div className="mt-1 flex items-center gap-2">
          {slides.slice(0, 8).map((slide, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  active ? "w-6 bg-red-600" : "w-1.5 bg-zinc-500 hover:bg-zinc-300"
                }`}
                aria-label={`Go to featured slide ${index + 1}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
