"use client";

import Link from "next/link";

export function PosterCard({ item }) {
  const qualityBadge = item.contentType === "movie" ? "WEB-DL" : "TV";
  const type = item.contentType === "movie" ? "movie" : "show";
  const detailPath = `/movie/${item.id}-${type}`;
  const roundedRating = Number.isFinite(Number(item.rating)) ? Math.round(Number(item.rating)) : 7;

  return (
    <Link href={detailPath}>
      <article className="group w-36 shrink-0 cursor-pointer space-y-2 sm:w-44">
        <div className="relative aspect-2/3 overflow-hidden rounded-sm bg-zinc-900 transition duration-200 group-hover:z-10 group-hover:scale-[1.08] group-hover:shadow-[0_20px_42px_rgba(0,0,0,0.55)]">
        <div
          className="absolute inset-0 bg-linear-to-br from-zinc-700/20 via-zinc-900/50 to-black/90"
          style={
            item.posterUrl
              ? {
                  backgroundImage: `url('${item.posterUrl}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/12 to-transparent" />

        <div className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-100">
          {item.contentType === "movie" ? "Movie" : "TV"}
        </div>

        <div className="absolute right-2 top-2 rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-black tracking-wide text-black">
          {qualityBadge}
        </div>

        <div className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-300">
          ★ {roundedRating}
        </div>

        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-zinc-200">
          {item.year ?? "-"}
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-4 bg-linear-to-t from-black/95 via-black/70 to-transparent p-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="mb-1 flex items-center justify-between text-[11px] text-zinc-200">
            <span>{item.contentType === "movie" ? "Film" : "Series"}</span>
            <span>{roundedRating}/10</span>
          </div>
          <p className="line-clamp-2 text-[10px] leading-relaxed text-zinc-300">{item.overview || item.title}</p>
        </div>
      </div>

      <div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-100">
          {item.title}
        </h3>
      </div>
    </article>
    </Link>
  );
}
