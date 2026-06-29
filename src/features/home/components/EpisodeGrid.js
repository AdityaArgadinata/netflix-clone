"use client";

import Image from "next/image";
import Link from "next/link";

function formatEpisodeCode(seasonNumber, episodeNumber) {
  const season = String(seasonNumber || 1).padStart(2, "0");
  const episode = String(episodeNumber || 1).padStart(2, "0");
  return `S${season}E${episode}`;
}

function formatEpisodeDate(date) {
  if (!date) return null;

  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(parsedDate);
}

export function EpisodeGrid({ episodes, buildEpisodeHref, currentEpisode }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {episodes.map((episode) => {
        const isCurrentEpisode =
          currentEpisode &&
          episode.seasonNumber === currentEpisode.seasonNumber &&
          episode.episodeNumber === currentEpisode.episodeNumber;
        const episodeDate = formatEpisodeDate(episode.airDate);

        return (
          <Link key={episode.id} href={buildEpisodeHref(episode)} className="group block min-w-0">
            <div
              className={`relative aspect-video overflow-hidden rounded-lg bg-zinc-800 ${
                isCurrentEpisode ? "ring-2 ring-red-500" : ""
              }`}
            >
              {episode.stillUrl ? (
                <Image
                  src={episode.stillUrl}
                  alt={`Episode ${episode.episodeNumber}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-700 to-zinc-900">
                  <svg className="h-8 w-8 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    <path d="M14 10a1 1 0 11-2 0 1 1 0 012 0z" opacity="0.5" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/75 to-transparent" />
              <div className="absolute left-2 top-2 rounded bg-black/65 px-2 py-1 text-[10px] font-semibold text-white sm:text-xs">
                {formatEpisodeCode(episode.seasonNumber, episode.episodeNumber)}
              </div>
              {episodeDate && (
                <div className="absolute right-2 top-2 rounded bg-black/65 px-2 py-1 text-[10px] font-semibold text-white sm:text-xs">
                  {episodeDate}
                </div>
              )}
              {episode.runtime && (
                <div className="absolute bottom-2 right-2 rounded bg-black/65 px-2 py-1 text-[10px] font-semibold text-white sm:text-xs">
                  {episode.runtime}m
                </div>
              )}
            </div>
            <div className="mt-2 min-w-0">
              <h3 className="line-clamp-1 text-xs font-semibold text-white sm:text-sm">
                {episode.title || `Episode ${episode.episodeNumber}`}
              </h3>
              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-500 sm:text-xs">
                {episode.overview || "No synopsis available."}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
