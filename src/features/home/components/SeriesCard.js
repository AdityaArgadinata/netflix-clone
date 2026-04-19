"use client";

import Link from "next/link";
import Image from "next/image";

export function SeriesCard({ item }) {
  const detailPath = `/movie/${item.id}-show`;
  const roundedRating = Number.isFinite(Number(item.rating)) ? Math.round(Number(item.rating)) : 8;

  return (
    <Link href={detailPath}>
      <article className="group relative min-h-52 w-80 shrink-0 cursor-pointer overflow-hidden rounded-md bg-zinc-900 transition duration-300 hover:z-10 hover:scale-[1.03] hover:shadow-[0_20px_42px_rgba(0,0,0,0.55)] sm:w-96">
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

        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/45 to-black/35" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/80" />

        <div className="relative flex h-full flex-col p-4">
          <div className="mb-8 flex items-center gap-1.5">
            <span className="inline-block rounded-sm bg-[#e50914] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              TV Series
            </span>
            {item.label && (
              <span className="inline-block rounded-md bg-amber-500/80 px-1.5 py-0.5 text-[8px] font-semibold text-white">
                {item.label}
              </span>
            )}
          </div>

          <div className="mb-2 flex min-h-8 items-center">
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
              <h3 className="line-clamp-2 text-base font-bold leading-tight text-white">
                {item.title}
              </h3>
            )}
          </div>

          <div className="mb-1.5 flex flex-wrap items-center gap-1 text-[10px] text-zinc-200 sm:text-xs">
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

          <p className="mb-2 line-clamp-2 text-[11px] leading-snug text-zinc-300">
            {item.overview}
          </p>

          <span className="mt-auto inline-flex w-fit items-center gap-1 rounded bg-white px-3 py-1 text-[11px] font-bold text-black">
            <span>▶</span>
            <span>Details</span>
          </span>
        </div>
      </article>
    </Link>
  );
}
