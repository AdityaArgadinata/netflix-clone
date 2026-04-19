"use client";

import Link from "next/link";
import Image from "next/image";

export function SeriesCard({ item }) {
  const detailPath = `/movie/${item.id}-show`;
  const roundedRating = Number.isFinite(Number(item.rating)) ? Math.round(Number(item.rating)) : 8;

  return (
    <Link href={detailPath}>
      <article className="group relative shrink-0 w-80 sm:w-96 rounded-lg overflow-hidden transition duration-300 hover:shadow-lg cursor-pointer min-h-52">
        {/* Backdrop Banner */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={
            item.backdropUrl
              ? {
                  backgroundImage: `url('${item.backdropUrl}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : { backgroundColor: "#18181b" }
          }
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/70" />

        {/* Content Container */}
        <div className="relative h-full flex flex-col justify-content p-3">
          {/* Type Badge */}
          <div className="flex items-center gap-1.5 mb-8">
            <span className="inline-block rounded-md bg-red-600 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
              TV Series
            </span>
            {item.label && (
              <span className="inline-block rounded-md bg-amber-500/80 px-1.5 py-0.5 text-[8px] font-semibold text-white">
                {item.label}
              </span>
            )}
          </div>

          {/* Logo or Title */}
          <div className="min-h-8 mb-2 flex items-center">
            {item.logoUrl ? (
              <Image
                src={item.logoUrl}
                alt={item.title}
                width={200}
                height={60}
                className="h-8 w-auto object-contain"
                priority={false}
              />
            ) : (
              <h3 className="text-base font-bold leading-tight text-white line-clamp-2">
                {item.title}
              </h3>
            )}
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-xs text-zinc-200 mb-1.5">
            <span className="font-bold text-yellow-300">★ {roundedRating}</span>
            {item.seasons && (
              <>
                <span>•</span>
                <span>{item.seasons}S</span>
              </>
            )}
            {item.year && (
              <>
                <span>•</span>
                <span>{item.year}</span>
              </>
            )}
          </div>

          {/* Overview/Synopsis */}
          <p className="text-[11px] leading-snug text-zinc-300 line-clamp-2 mb-2">
            {item.overview}
          </p>

          {/* Watch Now Button */}
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-red-500 active:bg-red-700 w-fit"
            onClick={(e) => {
              e.preventDefault();
              if (item.trailerUrl) {
                window.open(item.trailerUrl, "_blank");
              }
            }}
          >
            <span>▷</span>
            <span>Watch</span>
          </button>
        </div>
      </article>
    </Link>
  );
}
