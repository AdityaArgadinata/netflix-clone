"use client";

import Link from "next/link";

export function PosterCard({ item }) {
  const qualityBadge = item.contentType === "movie" ? "WEB-DL" : "TV";
  const type = item.contentType === "movie" ? "movie" : "show";
  const detailPath = `/movie/${item.id}-${type}`;
  const roundedRating = Number.isFinite(Number(item.rating)) ? Math.round(Number(item.rating)) : 7;

  return (
    <Link href={detailPath}>
      <article className="group w-38 shrink-0 space-y-2 cursor-pointer sm:w-43">
        <div className="relative aspect-2/3 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition duration-200 group-hover:scale-[1.03] group-hover:border-zinc-500/70 group-hover:shadow-[0_14px_28px_rgba(0,0,0,0.45)]">
        <div
          className="absolute inset-0 bg-linear-to-br from-zinc-700/25 via-zinc-900/40 to-black/90"
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
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />

        <div className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-100">
          {item.contentType === "movie" ? "Movie" : "TV"}
        </div>

        <div className="absolute right-2 top-2 rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-black tracking-wide text-black">
          {qualityBadge}
        </div>

        <div className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-300">
          ★ {roundedRating}
        </div>

        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-zinc-200">
          {item.commentCount ?? 0}
        </div>
      </div>

      <div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-100">
          {item.title}
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          {item.year ?? "-"}
        </p>
      </div>
    </article>
    </Link>
  );
}
