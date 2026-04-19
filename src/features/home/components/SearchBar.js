"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { searchContent, TOP_SEARCHES } from "@/features/home/api/searchContent";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Fetch search results
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const data = await searchContent(query);
        setResults(data || []);
        setIsOpen(true);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    if (query.trim() || results.length > 0) {
      setIsOpen(true);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Can navigate to search results page if needed
      setIsOpen(false);
    }
  };

  const handleTopSearchClick = (search) => {
    setQuery(search);
    setIsOpen(true);
  };

  const displayItems = results.length > 0 ? results : (query.trim() === "" ? [] : []);
  const showTopSearches = !query.trim() && isOpen;

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            placeholder="Search movies, series..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-2 pr-10 text-sm placeholder-zinc-500 text-white transition focus:border-red-500/50 focus:bg-zinc-900 focus:outline-none"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-red-600" />
            </div>
          )}
          {!isLoading && query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
          {!isLoading && !query && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600">
              🔍
            </div>
          )}
        </div>
      </form>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/95 shadow-2xl backdrop-blur-sm">
          {/* Top Searches */}
          {showTopSearches && (
            <div className="border-b border-zinc-700">
              <div className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                📍 Top Searches Now
              </div>
              <ul className="space-y-1 px-2 pb-2">
                {TOP_SEARCHES.map((search, index) => (
                  <li key={search}>
                    <button
                      type="button"
                      onClick={() => handleTopSearchClick(search)}
                      className="w-full flex items-center gap-3 rounded px-2 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-800/60 hover:text-white"
                    >
                      <span className="min-w-6 text-xs font-semibold text-zinc-500">
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
                  const href = `/movie/${item.id}-${contentType}`;

                  return (
                    <Link
                      key={`${item.id}-${item.type}`}
                      href={href}
                      className="block transition hover:bg-zinc-800/40"
                    >
                      <div className="flex gap-3 border-b border-zinc-800 px-3 py-2">
                        {/* Poster Thumbnail */}
                        {item.poster_path && (
                          <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-zinc-800">
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="40px"
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
                            {item.overview?.substring(0, 60)}...
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
            <div className="flex items-center justify-center px-4 py-8">
              <div className="text-center">
                <p className="text-sm text-zinc-400">No results for</p>
                <p className="text-sm font-semibold text-zinc-300">&quot;{query}&quot;</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center px-4 py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-red-600" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
