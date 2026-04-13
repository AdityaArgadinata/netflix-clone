"use client";

import { useRef } from "react";
import { PosterCard } from "@/features/home/components/PosterCard";

export function ContentRow({ row }) {
  const railRef = useRef(null);

  function scrollByDirection(direction) {
    if (!railRef.current) return;
    railRef.current.scrollBy({
      left: direction * 640,
      behavior: "smooth",
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white sm:text-xl">{row.title}</h2>
        <a className="text-sm text-zinc-400 transition hover:text-zinc-200" href="#">
          View All
        </a>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => scrollByDirection(-1)}
          className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-zinc-700 bg-black/65 px-3 py-2 text-sm font-bold text-zinc-100 transition hover:border-zinc-300 hover:bg-black/85 lg:block"
          aria-label={`Scroll ${row.title} left`}
        >
          ‹
        </button>

        <button
          type="button"
          onClick={() => scrollByDirection(1)}
          className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-zinc-700 bg-black/65 px-3 py-2 text-sm font-bold text-zinc-100 transition hover:border-zinc-300 hover:bg-black/85 lg:block"
          aria-label={`Scroll ${row.title} right`}
        >
          ›
        </button>

        <div
          ref={railRef}
          className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {row.items.map((item) => (
            <PosterCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
