"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { VideoPlayer } from "@/features/home/components/VideoPlayer";
import { buildEpisodePath } from "@/lib/routing/contentPath";

export function EpisodeDetail({ series, episode }) {
  const router = useRouter();
  const [showPlayer, setShowPlayer] = useState(false);
  const [failedStudioLogos, setFailedStudioLogos] = useState(new Set());

  if (!series || !episode) return null;

  const year = series.releaseDate ? series.releaseDate.split("-")[0] : "N/A";
  const coverImage = episode.stillUrl || series.backdropUrl;
  const episodeLabel = `Season ${episode.seasonNumber} • Episode ${episode.episodeNumber}`;
  const roundedSeriesRating = Number.isFinite(Number(series.rating)) ? Math.round(Number(series.rating)) : "N/A";
  const studioPartners = Array.isArray(series.studioPartners) ? series.studioPartners : [];
  const markStudioLogoFailed = (studioKey) => {
    setFailedStudioLogos((prev) => new Set([...prev, studioKey]));
  };
  const buildEpisodeHref = (item) =>
    buildEpisodePath({
      id: series.id,
      title: series.title,
      season: item.seasonNumber,
      episode: item.episodeNumber,
    });
  const displayCast = episode.cast && episode.cast.length > 0 ? episode.cast : series.cast;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      {showPlayer && (
        <VideoPlayer
          movieId={series.id}
          isTV
          season={episode.seasonNumber}
          episode={episode.episodeNumber}
          onClose={() => setShowPlayer(false)}
        />
      )}

      <div className="relative h-96 w-full bg-zinc-900 sm:h-125">
        {coverImage && (
          <Image
            src={coverImage}
            alt={episode.title || series.title}
            fill
            className="object-cover object-center"
            priority
            loading="eager"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0a0a0f]/50 to-[#0a0a0f]" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={() => setShowPlayer(true)}
              className="flex h-20 w-20 items-center justify-center rounded-full border border-white/35 bg-black/25 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:border-red-500 hover:bg-red-600"
              aria-label="Play episode"
            >
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-4 sm:bottom-6">
          <div className="page-container">
            <div className="max-w-xl">
              <p className="inline-flex rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-100 backdrop-blur-sm">
                {episodeLabel}
              </p>
              <h1 className="mt-3 text-2xl font-bold text-white drop-shadow-2xl sm:text-4xl">
                {episode.title || `Episode ${episode.episodeNumber}`}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container relative z-10">
        <div className="flex max-w-2xl flex-col pt-4">
          <button
            onClick={() => router.back()}
            className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 transition hover:border-zinc-500"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {!series.logoUrl && (
            <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">{series.title}</h2>
          )}

          <div className="mb-6 flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded bg-zinc-700 px-6 py-2 text-white transition hover:bg-zinc-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75h10.5a1.5 1.5 0 011.5 1.5v15l-6.75-3.75L5.25 20.25v-15a1.5 1.5 0 011.5-1.5z" />
              </svg>
              Watchlist
            </button>
            <button className="flex items-center gap-2 rounded bg-zinc-700 px-6 py-2 text-white transition hover:bg-zinc-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.53L12 21.35z" />
              </svg>
              Favourite
            </button>
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-2 border-b border-zinc-700 pb-4 text-sm text-zinc-300">
            <span className="font-semibold text-zinc-100">{year}</span>
            <span className="text-zinc-500">•</span>

            {series.seasons ? (
              <>
                <span className="text-zinc-100">{series.seasons} Season{series.seasons > 1 ? "s" : ""}</span>
                <span className="text-zinc-500">•</span>
              </>
            ) : null}

            <span className="text-zinc-100">{episodeLabel}</span>
            <span className="text-zinc-500">•</span>

            {episode.runtime ? (
              <>
                <span className="text-zinc-100">{episode.runtime} min</span>
                <span className="text-zinc-500">•</span>
              </>
            ) : null}

            <span className="font-semibold text-yellow-300">★ {roundedSeriesRating}</span>
            <span className="text-zinc-500">•</span>

            {series.productionCountries.length > 0 && (
              <>
                <span className="text-zinc-100">{series.productionCountries[0]}</span>
                <span className="text-zinc-500">•</span>
              </>
            )}

            {series.status && (
              <span
                className={`rounded px-2 py-0.5 text-xs font-semibold ${
                  series.status === "Returning Series"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {series.status}
              </span>
            )}
          </div>

          <p className="mb-2 text-sm uppercase tracking-wide text-zinc-500">Episode Synopsis</p>
          <h2 className="mb-3 text-2xl font-bold text-white">{episode.title || `Episode ${episode.episodeNumber}`}</h2>
          <p className="mb-6 text-sm italic text-zinc-400">{episode.overview || series.overview || "No synopsis available."}</p>

          {series.creators && series.creators.length > 0 && (
            <p className="mb-4 text-sm text-zinc-300">
              <span className="text-zinc-400">Creator:</span>{" "}
              <span className="text-zinc-100">{series.creators.join(", ")}</span>
            </p>
          )}

          {series.genres.length > 0 && (
            <p className="mb-4 text-sm text-zinc-300">
              <span className="text-zinc-400">Genres:</span>{" "}
              <span className="text-zinc-100">{series.genres.join(", ")}</span>
            </p>
          )}
        </div>

        <div className="mb-12 mt-8 max-w-3xl">
          <h3 className="mb-3 text-lg font-bold text-white">Episode Summary</h3>
          <p className="leading-relaxed text-sm text-zinc-300">
            {episode.overview || series.overview || "No synopsis available."}
          </p>

          {studioPartners.length > 0 && (
            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-6">
                {studioPartners.map((studio) => {
                  const studioKey = `${studio.id}-${studio.name}`;
                  const hasLogo = Boolean(studio.logoUrl) && !failedStudioLogos.has(studioKey);

                  return (
                    hasLogo ? (
                      <Image
                        key={studioKey}
                        src={studio.logoUrl}
                        alt={studio.name}
                        width={240}
                        height={72}
                        onError={() => markStudioLogoFailed(studioKey)}
                        className="h-7 sm:h-9 w-auto max-w-25 sm:max-w-30 object-contain shrink-0 opacity-40 hover:opacity-70 transition-opacity grayscale invert"
                        sizes="(max-width: 640px) 100px, 120px"
                      />
                    ) : (
                      <span
                        key={studioKey}
                        className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300/80"
                      >
                        {studio.name}
                      </span>
                    )
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {series.episodes && series.episodes.length > 0 && (
          <div className="mb-16 border-t border-zinc-800 pt-12">
            <h3 className="mb-6 text-2xl font-bold text-white">Episodes (Season 1)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {series.episodes.map((item) => {
                const isCurrentEpisode =
                  item.seasonNumber === episode.seasonNumber && item.episodeNumber === episode.episodeNumber;

                return (
                  <Link
                    key={item.id}
                    href={buildEpisodeHref(item)}
                    className={`group block overflow-hidden rounded-lg bg-zinc-900 transition duration-200 hover:shadow-lg ${
                      isCurrentEpisode ? "ring-2 ring-red-500" : ""
                    }`}
                  >
                    <div className="relative aspect-video overflow-hidden bg-zinc-800">
                      {item.stillUrl ? (
                        <Image
                          src={item.stillUrl}
                          alt={`Episode ${item.episodeNumber}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw"
                          className="object-cover transition duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-700 to-zinc-900">
                          <svg className="h-12 w-12 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            <path d="M14 10a1 1 0 11-2 0 1 1 0 012 0z" opacity="0.5" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-semibold text-white">
                        Ep {item.episodeNumber}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="mb-2 line-clamp-2 text-sm font-bold text-white">{item.title}</h4>
                      <p className="line-clamp-3 text-xs text-zinc-400">{item.overview || "No synopsis available."}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-zinc-500">{item.airDate || "TBA"}</span>
                        {Number.isFinite(Number(item.rating)) && (
                          <span className="text-xs text-yellow-300">★ {Math.round(Number(item.rating))}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {displayCast && displayCast.length > 0 && (
          <div className="mb-16 border-t border-zinc-800 pt-12">
            <h3 className="mb-6 text-2xl font-bold text-white">Cast</h3>
            <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {displayCast.map((actor) => (
                <div key={actor.id} className="group text-center">
                  <div className="relative mb-3 inline-block">
                    <div className="relative h-32 w-32 overflow-hidden rounded-full bg-zinc-800 shadow-lg">
                      {actor.profile_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
                          alt={actor.name}
                          fill
                          sizes="128px"
                          className="object-cover transition duration-200 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-700">
                          <svg className="h-12 w-12 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm font-semibold text-zinc-100">{actor.name}</p>
                  <p className="line-clamp-2 text-xs text-zinc-400">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-zinc-800 py-8">
          <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-3">
            <div>
              <p className="text-zinc-400">Release Date</p>
              <p className="font-semibold text-white">{series.releaseDate || "N/A"}</p>
            </div>
            <div>
              <p className="text-zinc-400">Popularity</p>
              <p className="font-semibold text-white">{series.popularity?.toFixed(0) || "N/A"}</p>
            </div>
            <div>
              <p className="text-zinc-400">Episode Air Date</p>
              <p className="font-semibold text-white">{episode.airDate || "N/A"}</p>
            </div>
          </div>
        </div>

        {(series.crew?.length > 0 || series.creators?.length > 0) && (
          <div className="border-t border-zinc-800 py-8">
            <h3 className="mb-6 text-2xl font-bold text-white">Creators & Crew</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {series.creators?.length > 0 && (
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-white">Created By</h4>
                  <div className="space-y-2">
                    {series.creators.map((creator, idx) => (
                      <p key={idx} className="text-zinc-300">{creator}</p>
                    ))}
                  </div>
                </div>
              )}

              {series.crew && series.crew.length > 0 && (
                <>
                  {series.crew.filter((c) => c.job === "Director").slice(0, 5).length > 0 && (
                    <div>
                      <h4 className="mb-3 text-lg font-semibold text-white">
                        Director{series.crew.filter((c) => c.job === "Director").length > 1 ? "s" : ""}
                      </h4>
                      <div className="space-y-2">
                        {series.crew
                          .filter((c) => c.job === "Director")
                          .slice(0, 5)
                          .map((director, idx) => (
                            <p key={idx} className="text-zinc-300">{director.name}</p>
                          ))}
                      </div>
                    </div>
                  )}

                  {series.crew.filter((c) => c.job === "Writer" || c.job === "Screenplay").slice(0, 5).length > 0 && (
                    <div>
                      <h4 className="mb-3 text-lg font-semibold text-white">
                        Writer{series.crew.filter((c) => c.job === "Writer" || c.job === "Screenplay").length > 1 ? "s" : ""}
                      </h4>
                      <div className="space-y-2">
                        {series.crew
                          .filter((c) => c.job === "Writer" || c.job === "Screenplay")
                          .slice(0, 5)
                          .map((writer, idx) => (
                            <p key={idx} className="text-zinc-300">{writer.name}</p>
                          ))}
                      </div>
                    </div>
                  )}

                  {series.crew.filter((c) => c.job === "Producer").slice(0, 5).length > 0 && (
                    <div>
                      <h4 className="mb-3 text-lg font-semibold text-white">
                        Producer{series.crew.filter((c) => c.job === "Producer").length > 1 ? "s" : ""}
                      </h4>
                      <div className="space-y-2">
                        {series.crew
                          .filter((c) => c.job === "Producer")
                          .slice(0, 5)
                          .map((producer, idx) => (
                            <p key={idx} className="text-zinc-300">{producer.name}</p>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}