"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

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
      <section className="relative min-h-[60vh] px-6 pt-28 pb-14 sm:px-12 sm:pt-32 lg:px-16">
        <div className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-8">
          <p className="text-zinc-300">Konten unggulan belum tersedia.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[78vh] overflow-hidden bg-linear-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-6 pt-24 pb-16 sm:px-12 sm:pt-28 lg:px-16">
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={`${slide.id}-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.backdropUrl && (
              <Image
                src={slide.backdropUrl}
                alt={slide.title}
                fill
                className="object-cover object-center"
                style={{ objectPosition: "center 20%" }}
                priority={index === activeIndex}
                loading={index === activeIndex ? "eager" : "lazy"}
                sizes="100vw"
              />
            )}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(92deg,rgba(5,6,10,0.86)_8%,rgba(5,6,10,0.44)_46%,rgba(5,6,10,0.84)_96%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(6,7,11,1)_0%,rgba(6,7,11,0.22)_35%,rgba(6,7,11,0)_65%)]" />

      <div className="relative flex w-full flex-col justify-end gap-4 pt-60 sm:pt-20 max-w-2xl">
        <p className="inline-block w-fit rounded bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          {item.contentType === "movie" ? "Movie" : "TV Series"}
        </p>

        {/* Logo or Title */}
        <div className="h-20 flex items-start">
          {item.logoUrl ? (
            <Image
              src={item.logoUrl}
              alt={item.title}
              width={300}
              height={100}
              className="h-16 w-auto object-contain"
              priority
              loading="eager"
              sizes="(max-width: 768px) 200px, 300px"
            />
          ) : (
            <h1 className="max-w-3xl text-4xl font-light leading-[0.95] text-white sm:text-6xl">
              {item.title}
            </h1>
          )}
        </div>

        {/* Tagline */}
        {item.tagline && (
          <p className="italic text-zinc-300 text-sm sm:text-base line-clamp-1 mb-2">
            {item.tagline}
          </p>
        )}

        {/* Genres */}
        {item.genres && item.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.genres.slice(0, 4).map((genre) => (
              <span
                key={genre}
                className="inline-block rounded-full border border-zinc-600 px-3 py-1 text-xs font-medium text-zinc-300 hover:border-zinc-400 transition"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-200 sm:text-sm">
          <span className="font-bold text-yellow-300">★ {item.rating ?? "8.0"}</span>
          {item.year ? <span>•</span> : null}
          {item.year ? <span>{item.year}</span> : null}
          {item.seasons ? (
            <>
              <span>•</span>
              <span>{`${item.seasons} Season${item.seasons > 1 ? "s" : ""}`}</span>
            </>
          ) : null}
          {item.runtime ? (
            <>
              <span>•</span>
              <span>{`${item.runtime} min`}</span>
            </>
          ) : null}
          {item.status ? (
            <>
              <span>•</span>
              <span className="rounded bg-green-700/70 px-2 py-0.5 text-[11px] font-semibold text-green-200">
                {item.status === "Returning Series" ? "ONGOING" : item.status}
              </span>
            </>
          ) : null}
        </div>

        {/* Synopsis - Fixed height to prevent layout shift */}
        <div className="h-24 overflow-hidden">
          <p className="text-sm leading-relaxed text-zinc-300 line-clamp-4">
            {item.overview}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
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

        {/* Slide Indicators */}
        <div className="mt-4 flex items-center gap-2 h-4">
          {slides.slice(0, 8).map((slide, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`rounded-full transition-all ${
                  active ? "h-1.5 w-6 bg-red-600" : "h-1.5 w-1.5 bg-zinc-500 hover:bg-zinc-300"
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
