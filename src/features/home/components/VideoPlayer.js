"use client";

import { useMemo, useState } from "react";

export function VideoPlayer({ movieId, isTV = false, season = 1, episode = 1, onClose }) {
  // Dynamically import players based on type
  const players = useMemo(() => {
    if (isTV) {
      const getTvShowPlayers = require("@/features/home/api/getPlayers").getTvShowPlayers;
      return getTvShowPlayers(movieId, season, episode);
    } else {
      const getMoviePlayers = require("@/features/home/api/getPlayers").getMoviePlayers;
      return getMoviePlayers(movieId);
    }
  }, [movieId, isTV, season, episode]);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(() => {
    const vidKingIndex = players.findIndex((player) => player.title === "VidKing");
    return vidKingIndex >= 0 ? vidKingIndex : 0;
  });
  const [isPlayerDropdownOpen, setIsPlayerDropdownOpen] = useState(false);

  const currentPlayer = players[selectedPlayerIndex];

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
          />
        </div>
      </div>

      {/* Player Selection */}
      <div className="border-t border-zinc-800 bg-black/50 p-3 sm:p-4">
        <div className="max-w-7xl mx-auto">
          <button
            type="button"
            onClick={() => setIsPlayerDropdownOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-left transition hover:border-zinc-500"
            aria-expanded={isPlayerDropdownOpen}
            aria-controls="player-dropdown"
          >
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-400">Player aktif</p>
              <p className="text-sm font-semibold text-white sm:text-base">{currentPlayer.title}</p>
            </div>
            <svg
              className={`h-5 w-5 text-zinc-300 transition-transform ${isPlayerDropdownOpen ? "rotate-180" : "rotate-0"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            id="player-dropdown"
            className={`${isPlayerDropdownOpen ? "mt-3 max-h-56 sm:max-h-72 opacity-100" : "pointer-events-none mt-0 max-h-0 opacity-0"} overflow-hidden transition-all duration-300`}
          >
            <div className="max-h-56 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/90 p-2 sm:max-h-72">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {players.map((player, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedPlayerIndex(idx);
                      setIsPlayerDropdownOpen(false);
                    }}
                    className={`w-full rounded px-3 py-2 text-left text-sm font-medium transition ${
                      idx === selectedPlayerIndex
                        ? "bg-red-600 text-white"
                        : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{player.title}</span>
                      <div className="flex gap-1">
                        {player.recommended && (
                          <span className="inline-block h-2 w-2 rounded-full bg-green-400" title="Recommended" />
                        )}
                        {player.fast && (
                          <span className="inline-block h-2 w-2 rounded-full bg-blue-400" title="Fast" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-zinc-500">
            🟢 Recommended • 🔵 Fast
          </p>
        </div>
      </div>
    </div>
  );
}
