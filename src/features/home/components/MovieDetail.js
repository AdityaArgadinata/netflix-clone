"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { VideoPlayer } from "@/features/home/components/VideoPlayer";

export function MovieDetail({ movie }) {
  const router = useRouter();
  const [showPlayer, setShowPlayer] = useState(false);

  if (!movie) return null;

  const year = movie.releaseDate ? movie.releaseDate.split("-")[0] : "N/A";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      {showPlayer && (
        <VideoPlayer 
          movieId={movie.id}
          isTV={movie.seasons ? true : false}
          season={1}
          episode={1}
          onClose={() => setShowPlayer(false)}
        />
      )}
        {/* Header with back button */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 bg-linear-to-b from-black/80 to-transparent px-6 py-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 hover:bg-zinc-800 transition"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Backdrop Image */}
      <div className="relative h-96 w-full bg-zinc-900 sm:h-125">
        {movie.backdropUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${movie.backdropUrl}')` }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0a0a0f]/50 to-[#0a0a0f]" />
        
        {/* Logo overlaid on backdrop */}
        {movie.logoUrl && (
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 max-w-xs">
            <Image 
              src={movie.logoUrl} 
              alt={movie.title}
              width={500}
              height={200}
              className="h-20 sm:h-32 object-contain drop-shadow-2xl"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative w-full px-6 z-10 sm:px-12 lg:px-16">
        {/* Title and Info - Left Aligned */}
        <div className="flex flex-col pt-4 max-w-2xl">
          {/* Title - Show if no logo */}
          {!movie.logoUrl && (
            <h1 className="text-4xl font-bold text-white mb-6 sm:text-5xl">{movie.title}</h1>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button 
              onClick={() => setShowPlayer(true)}
              className="px-6 py-2 bg-white text-black rounded font-bold hover:bg-gray-200 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Play
            </button>
            <button className="px-6 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
              </svg>
              Watchlist
            </button>
            <button className="px-6 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.172 16.172a4 4 0 015.656 0l2.828-2.828a6 6 0 00-8.488 0l2.828 2.828zm3.656-9.656a4 4 0 00-5.656 0L4.172 9.172a6 6 0 018.488 0L12.828 6.344zM9 11a1 1 0 11-2 0 1 1 0 012 0zm6-4a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              Favourite
            </button>
          </div>

          {/* Meta Info - Single Horizontal Line */}
          <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-zinc-300 pb-4 border-b border-zinc-700">
            <span className="text-zinc-100 font-semibold">{year}</span>
            <span className="text-zinc-500">•</span>
            
            {movie.seasons ? (
              <>
                <span className="text-zinc-100">{movie.seasons} Season{movie.seasons > 1 ? 's' : ''}</span>
                <span className="text-zinc-500">•</span>
              </>
            ) : movie.runtime ? (
              <>
                <span className="text-zinc-100">{movie.runtime} min</span>
                <span className="text-zinc-500">•</span>
              </>
            ) : null}

            <span className="text-yellow-300 font-semibold">★ {movie.rating?.toFixed(1) || "N/A"}</span>
            <span className="text-zinc-500">•</span>

            {movie.productionCountries.length > 0 && (
              <>
                <span className="text-zinc-100">{movie.productionCountries[0]}</span>
                <span className="text-zinc-500">•</span>
              </>
            )}

            {movie.status && (
              <>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  movie.status === 'Returning Series' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {movie.status}
                </span>
              </>
            )}
          </div>

          {/* Creator */}
          {movie.creators && movie.creators.length > 0 && (
            <p className="text-sm text-zinc-300 mb-4">
              <span className="text-zinc-400">Creator:</span> <span className="text-zinc-100">{movie.creators.join(", ")}</span>
            </p>
          )}

          {/* Tagline */}
          {movie.tagline && (
            <p className="text-sm italic text-zinc-400 mb-6">{movie.tagline}</p>
          )}

          {/* Genres */}
          {movie.genres.length > 0 && (
            <p className="text-sm text-zinc-300 mb-4">
              <span className="text-zinc-400">Genres:</span> <span className="text-zinc-100">{movie.genres.join(", ")}</span>
            </p>
          )}
        </div>

        {/* Overview */}
        <div className="mt-8 mb-12 max-w-3xl">
          <h2 className="text-lg font-bold text-white mb-3">Synopsis</h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {movie.overview || "No synopsis available."}
          </p>
        </div>

        {/* Episodes for TV Series - Before Cast */}
        {movie.contentType === "tv_series" && movie.episodes && movie.episodes.length > 0 && (
          <div className="mb-16 border-t border-zinc-800 pt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Episodes (Season 1)</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {movie.episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="group cursor-pointer rounded-lg overflow-hidden bg-zinc-900 hover:shadow-lg transition duration-200"
                >
                  <div className="relative aspect-video overflow-hidden bg-zinc-800">
                    {episode.stillUrl ? (
                      <Image
                        src={episode.stillUrl}
                        alt={`Episode ${episode.episodeNumber}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw"
                        className="object-cover group-hover:scale-105 transition duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                        <svg className="w-12 h-12 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                          <path d="M14 10a1 1 0 11-2 0 1 1 0 012 0z" opacity="0.5" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-semibold text-white">
                      Ep {episode.episodeNumber}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-white mb-2 line-clamp-2">
                      {episode.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-3">{episode.overview || "No synopsis available."}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-zinc-500">{episode.airDate || "TBA"}</span>
                      {episode.rating && (
                        <span className="text-xs text-yellow-300">★ {episode.rating.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cast - Now with circular images, positioned after episodes */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="mb-16 border-t border-zinc-800 pt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Cast</h2>
            <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {movie.cast.map((actor) => (
                <div key={actor.id} className="group text-center">
                  <div className="relative mb-3 inline-block">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden bg-zinc-800 shadow-lg">
                      {actor.profile_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
                          alt={actor.name}
                          fill
                          sizes="128px"
                          className="object-cover group-hover:scale-110 transition duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                          <svg className="w-12 h-12 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold text-sm text-zinc-100 line-clamp-2">{actor.name}</p>
                  <p className="text-zinc-400 text-xs line-clamp-2">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="py-8 border-t border-zinc-800">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-zinc-400">Release Date</p>
              <p className="font-semibold text-white">{movie.releaseDate || "N/A"}</p>
            </div>
            <div>
              <p className="text-zinc-400">Popularity</p>
              <p className="font-semibold text-white">{movie.popularity?.toFixed(0) || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Crew/Artists */}
        {(movie.crew?.length > 0 || movie.creators?.length > 0) && (
          <div className="py-8 border-t border-zinc-800">
            <h2 className="text-2xl font-bold text-white mb-6">Creators & Crew</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Show Creators for TV Series */}
              {movie.creators?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Created By</h3>
                  <div className="space-y-2">
                    {movie.creators.map((creator, idx) => (
                      <p key={idx} className="text-zinc-300">{creator}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Show Crew Members Grouped by Role */}
              {movie.crew && movie.crew.length > 0 && (
                <>
                  {movie.crew
                    .filter((c) => c.job === "Director")
                    .slice(0, 5).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Director{movie.crew.filter((c) => c.job === "Director").length > 1 ? "s" : ""}</h3>
                      <div className="space-y-2">
                        {movie.crew
                          .filter((c) => c.job === "Director")
                          .slice(0, 5)
                          .map((director, idx) => (
                            <p key={idx} className="text-zinc-300">{director.name}</p>
                          ))}
                      </div>
                    </div>
                  )}

                  {movie.crew
                    .filter((c) => c.job === "Writer" || c.job === "Screenplay")
                    .slice(0, 5).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Writer{movie.crew.filter((c) => c.job === "Writer" || c.job === "Screenplay").length > 1 ? "s" : ""}</h3>
                      <div className="space-y-2">
                        {movie.crew
                          .filter((c) => c.job === "Writer" || c.job === "Screenplay")
                          .slice(0, 5)
                          .map((writer, idx) => (
                            <p key={idx} className="text-zinc-300">{writer.name}</p>
                          ))}
                      </div>
                    </div>
                  )}

                  {movie.crew
                    .filter((c) => c.job === "Producer")
                    .slice(0, 5).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Producer{movie.crew.filter((c) => c.job === "Producer").length > 1 ? "s" : ""}</h3>
                      <div className="space-y-2">
                        {movie.crew
                          .filter((c) => c.job === "Producer")
                          .slice(0, 5)
                          .map((producer, idx) => (
                            <p key={idx} className="text-zinc-300">{producer.name}</p>
                          ))}
                      </div>
                    </div>
                  )}

                  {movie.crew
                    .filter((c) => c.department === "Directing" && c.job !== "Director")
                    .slice(0, 5).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Other Directing</h3>
                      <div className="space-y-2">
                        {movie.crew
                          .filter((c) => c.department === "Directing" && c.job !== "Director")
                          .slice(0, 5)
                          .map((crew, idx) => (
                            <p key={idx} className="text-zinc-300">
                              {crew.name} <span className="text-zinc-500">({crew.job})</span>
                            </p>
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

      {/* Video Player Modal */}
      {showPlayer && (
        <VideoPlayer 
          movieId={movie.id}
          isTV={movie.seasons ? true : false}
          season={1}
          episode={1}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </div>
  );
}