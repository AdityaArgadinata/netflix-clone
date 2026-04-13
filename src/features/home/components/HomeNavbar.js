"use client";

import { useEffect, useState } from "react";

export function HomeNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const navItems = [
    "Home",
    "Movies",
    "TV Series",
    "Leaderboard",
    "Genres",
    "Country",
    "Year",
    "Network",
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 px-4 py-3 transition-colors duration-300 sm:px-8 ${
        isScrolled
          ? "bg-black/95"
          : "bg-linear-to-b from-black/80 to-transparent"
      }`}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-6">
          <a className="text-xl font-extrabold tracking-wide text-red-600 sm:text-2xl" href="#">
            PAWPAW
          </a>

          <ul className="hidden items-center gap-4 text-sm text-zinc-300 lg:flex">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  className="relative transition-colors hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-red-600 after:transition-transform hover:after:scale-x-100"
                  href="#"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-full border border-zinc-500/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-zinc-200 transition hover:border-zinc-200 hover:text-white">
            Sign In
          </button>
          <button className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold tracking-wide text-white transition hover:bg-red-500">
            Sign Up
          </button>
        </div>
      </nav>

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-zinc-800/90 transition-opacity duration-300 ${
          isScrolled ? "opacity-100" : "opacity-0"
        }`}
      />
    </header>
  );
}
