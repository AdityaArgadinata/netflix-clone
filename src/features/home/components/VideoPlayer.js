"use client";

import { useEffect } from "react";
import { getMoviePlayers, getTvShowPlayers } from "@/features/home/api/getPlayers";

export function VideoPlayer({ movieId, isTV = false, season = 1, episode = 1, onClose }) {
  const currentPlayer = isTV ? getTvShowPlayers(movieId, season, episode)[0] : getMoviePlayers(movieId)[0];

  // Prevent popup windows and external navigation
  useEffect(() => {
    const originalWindowOpen = window.open;
    window.open = function(...args) {
      console.log("Popup blocked:", args);
      return null;
    };

    return () => {
      window.open = originalWindowOpen;
    };
  }, []);

  if (!currentPlayer) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-800 sm:px-6 sm:py-4">
        <div>
          <h2 className="text-base font-bold text-white sm:text-lg">
            {isTV ? `Season ${season} • Episode ${episode}` : "Movie"}
          </h2>
          <p className="text-xs text-zinc-400 sm:text-sm">{currentPlayer.title}</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 transition hover:bg-zinc-800 sm:h-10 sm:w-10"
        >
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Player Container */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
        <div className="w-full h-full max-w-5xl">
          <iframe
            src={currentPlayer.source}
            allowFullScreen
            className="w-full h-full rounded-lg"
            title="Video Player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-fullscreen"
          />
        </div>
      </div>

    </div>
  );
}
