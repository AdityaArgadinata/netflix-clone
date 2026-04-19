"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchResults({ query, results = [] }) {
  const router = useRouter();
  const [failedImages, setFailedImages] = useState(new Set());

  const handleImageError = (itemId) => {
    setFailedImages(prev => new Set([...prev, itemId]));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      <div className="pt-24 sm:pt-28 lg:pt-32">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-black/95 py-4">
          <div className="page-container">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 hover:border-zinc-500 transition"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-semibold sm:text-xl">
                  Search Results for <span className="text-red-500">{query ? `"${query}"` : "(empty)"}</span>
                </h1>
                <p className="text-xs text-zinc-400 sm:text-sm">{results?.length || 0} results found</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="pb-8 pt-8">
          <div className="page-container">
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {results.map((item) => {
                const contentType = item.type === "tv" ? "show" : "movie";
                const href = `/movie/${item.id}-${contentType}`;

                return (
                  <Link key={`${item.id}-${item.type}`} href={href}>
                    <article className="group space-y-3 cursor-pointer">
                      {/* Poster */}
                      <div className="relative aspect-2/3 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 transition group-hover:border-zinc-500">
                        {item.poster_path && !failedImages.has(item.id) ? (
                          <>
                            <Image
                              src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                              alt={item.title}
                              fill
                              className="object-cover transition group-hover:scale-105"
                              sizes="(max-width: 640px) calc(50vw - 16px), (max-width: 1024px) calc(33vw - 16px), (max-width: 1280px) calc(25vw - 16px), calc(20vw - 16px)"
                              onError={() => handleImageError(item.id)}
                              loading="eager"
                              priority={false}
                            />
                            {/* Overlay with type badge */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
                              <div className="absolute top-2 right-2">
                                <span className="inline-block rounded-md bg-red-600/90 px-2 py-1 text-[10px] font-bold uppercase text-white">
                                  {item.type === "tv" ? "TV" : "Movie"}
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-b from-zinc-800 to-zinc-900">
                              <svg className="h-8 w-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs text-zinc-500">No image</span>
                            </div>
                            {/* Type badge for fallback */}
                            <div className="absolute top-2 right-2">
                              <span className="inline-block rounded-md bg-red-600/90 px-2 py-1 text-[10px] font-bold uppercase text-white">
                                {item.type === "tv" ? "TV" : "Movie"}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <h3 className="line-clamp-2 text-sm font-semibold text-white group-hover:text-red-500 transition sm:text-base">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
                          <span>{item.type === "tv" ? "Series" : "Movie"}</span>
                          {item.release_date || item.first_air_date ? (
                            <span>{(item.release_date || item.first_air_date).slice(0, 4)}</span>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 py-16">
              <svg
                className="h-16 w-16 text-zinc-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h2 className="mb-2 text-lg font-semibold text-zinc-300">No results found</h2>
              <p className="text-center text-sm text-zinc-400 max-w-md">
                We could not find results for <span className="font-semibold">&quot;{query}&quot;</span>. Try a different keyword.
              </p>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}
