"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { searchContent, TOP_SEARCHES } from "@/features/home/api/searchContent";
import { buildContentPath } from "@/lib/routing/contentPath";

export function SearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Fetch search results
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const data = await searchContent(query);
        setResults(data || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const navigateToSearch = (searchQuery) => {
    const normalizedQuery = searchQuery.trim();

    if (normalizedQuery) {
      const encodedQuery = encodeURIComponent(normalizedQuery);
      router.push(`/search?q=${encodedQuery}`);
      setQuery("");
      onClose();
    }
  };

  const handleTopSearchClick = (search) => {
    navigateToSearch(search);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigateToSearch(query);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      navigateToSearch(query);
    }
  };

  const handleResultClick = () => {
    setQuery("");
    onClose();
  };

  const displayItems = results.length > 0 ? results : (query.trim() === "" ? [] : []);
  const showTopSearches = !query.trim();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop Blur */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div
        className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 sm:pt-32"
        onClick={onClose}
      >
        <div className="w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
          {/* Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative"
          >
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search movies, series..."
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-5 py-3 pr-40 text-base text-white placeholder-zinc-500 transition focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 sm:pr-44"
              />
              <div className="pointer-events-none absolute right-12 top-1/2 hidden -translate-y-1/2 flex-wrap items-center gap-2 text-[10px] text-zinc-400 sm:flex sm:gap-3 sm:text-[11px]">
                <span className="rounded border border-zinc-700 bg-zinc-800/70 px-2 py-0.5 text-zinc-300">⌘K / Ctrl+K</span>
                <span className="rounded border border-zinc-700 bg-zinc-800/70 px-2 py-0.5 text-zinc-300">Esc</span>
              </div>
              {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-red-600" />
                </div>
              )}
              {!isLoading && query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          {/* Results Dropdown */}
          {(showTopSearches || displayItems.length > 0 || query.trim()) && (
            <div className="mt-3 max-h-96 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/95 shadow-2xl backdrop-blur-sm">
              {/* Top Searches */}
              {showTopSearches && (
                <div className="border-b border-zinc-700">
                  <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    📍 Top Searches Now
                  </div>
                  <ul className="space-y-0 px-2 pb-2">
                    {TOP_SEARCHES.map((search, index) => (
                      <li key={search}>
                        <button
                          type="button"
                          onClick={() => handleTopSearchClick(search)}
                          className="w-full flex items-center gap-3 rounded px-2 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-800/60 hover:text-white"
                        >
                          <span className="min-w-4 text-xs font-semibold text-zinc-500">
                            {index + 1}
                          </span>
                          <span className="truncate">{search}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Search Results */}
              {displayItems.length > 0 && (
                <div>
                  <div className="max-h-80 overflow-y-auto">
                    {displayItems.map((item) => {
                      const contentType = item.type === "tv" ? "show" : "movie";
                      const href = buildContentPath({ id: item.id, title: item.title, type: contentType });

                      return (
                        <Link
                          key={`${item.id}-${item.type}`}
                          href={href}
                          onClick={handleResultClick}
                          className="block transition hover:bg-zinc-800/40"
                        >
                          <div className="flex gap-3 border-b border-zinc-800 px-3 py-2">
                            {/* Poster Thumbnail */}
                            {item.poster_path && (
                              <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-zinc-800">
                                <Image
                                  src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                  sizes="44px"
                                />
                              </div>
                            )}

                            {/* Info */}
                            <div className="min-w-0 flex-1 py-1">
                              <h4 className="truncate text-sm font-semibold text-white">
                                {item.title}
                              </h4>
                              <p className="truncate text-xs text-zinc-400">
                                {item.type === "tv" ? "TV Series" : "Movie"}
                                {item.release_date || item.first_air_date
                                  ? ` • ${(
                                      item.release_date ||
                                      item.first_air_date
                                    ).slice(0, 4)}`
                                  : ""}
                              </p>
                              <p className="line-clamp-1 text-xs text-zinc-500">
                                {item.overview?.substring(0, 70)}...
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Results */}
              {query.trim() && displayItems.length === 0 && !isLoading && (
                <div className="flex items-center justify-center px-4 py-12">
                  <div className="text-center">
                    <p className="text-sm text-zinc-400">No results for</p>
                    <p className="text-sm font-semibold text-zinc-300">&quot;{query}&quot;</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
