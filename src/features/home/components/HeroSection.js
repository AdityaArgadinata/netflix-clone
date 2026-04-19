"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
  const roundedRating = Number.isFinite(Number(item?.rating)) ? Math.round(Number(item.rating)) : 8;
  const detailPath = item?.id
    ? `/movie/${item.id}-${item.contentType === "tv_series" ? "show" : "movie"}`
    : "/";

  if (!item) {
    return (
      <section className="relative min-h-[60vh] pb-14 pt-28 sm:pt-32">
        <div className="page-container">
          <div className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-8">
            <p className="text-zinc-300">Featured content is not available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[84vh] overflow-hidden bg-[#111111] pb-16 pt-24 sm:pt-28">
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

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.9)_16%,rgba(0,0,0,0.55)_45%,rgba(0,0,0,0.75)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(17,17,17,1)_0%,rgba(17,17,17,0.2)_38%,rgba(17,17,17,0)_70%)]" />

      <div className="page-container">
        <div className="relative flex w-full max-w-2xl flex-col justify-end gap-4 pt-56 sm:pt-24">
          <p className="inline-block w-fit rounded bg-[#e50914] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
            {item.contentType === "movie" ? "Movie" : "TV Series"}
          </p>

          <div className="flex min-h-20 items-start">
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
              <h1 className="max-w-3xl text-4xl font-semibold leading-[0.95] text-white sm:text-6xl">
                {item.title}
              </h1>
            )}
          </div>

          {item.tagline && (
            <p className="mb-1 line-clamp-1 text-sm italic text-zinc-300 sm:text-base">
              {item.tagline}
            </p>
          )}

          {item.genres && item.genres.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {item.genres.slice(0, 4).map((genre) => (
                <span
                  key={genre}
                  className="inline-block rounded border border-zinc-500 bg-black/25 px-2.5 py-1 text-xs font-medium text-zinc-200"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-200 sm:text-sm">
            <span className="font-bold text-yellow-300">★ {roundedRating}</span>
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
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-200">
                  {item.status === "Returning Series" ? "ONGOING" : item.status}
                </span>
              </>
            ) : null}
          </div>

          <div className="h-24 overflow-hidden">
            <p className="line-clamp-4 text-sm leading-relaxed text-zinc-200">
              {item.overview}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href={detailPath}
              className="inline-flex items-center gap-2 rounded bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              <span>▶</span>
              <span>Play</span>
            </Link>
            <Link
              href={detailPath}
              className="inline-flex items-center gap-2 rounded bg-zinc-500/80 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-400/85"
            >
              <span>i</span>
              <span>More Info</span>
            </Link>
          </div>

          <div className="mt-4 flex h-4 items-center gap-2">
            {slides.slice(0, 8).map((slide, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full transition-all ${
                    active ? "h-1.5 w-6 bg-[#e50914]" : "h-1.5 w-1.5 bg-zinc-500 hover:bg-zinc-200"
                  }`}
                  aria-label={`Go to featured slide ${index + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
