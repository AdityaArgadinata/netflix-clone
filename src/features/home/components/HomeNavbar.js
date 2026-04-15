"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchModal } from "@/features/home/components/SearchModal";

export function HomeNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    // Close menu on Escape
    if (isMobileMenuOpen) {
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          setIsMobileMenuOpen(false);
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isMobileMenuOpen]);

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
      <nav className="mx-auto w-full max-w-7xl">
        {/* Single Row Layout */}
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Logo */}
          <Link className="text-xl font-extrabold tracking-wide text-red-600 sm:text-2xl" href="/">
            PAWPAW
          </Link>

          {/* Nav items - hidden on mobile */}
          <ul className="hidden items-center gap-4 text-sm text-zinc-300 lg:flex flex-1 ml-8">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  className="relative transition-colors hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-red-600 after:transition-transform hover:after:scale-x-100"
                  href={item === "Home" ? "/" : "#"}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>

          {/* Right Section - Search Icon, Burger Menu */}
          <div className="flex items-center gap-3">
            {/* Search Icon Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition"
              aria-label="Search"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Auth Buttons - Desktop only */}
            <button className="hidden sm:block rounded-full border border-zinc-500/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-zinc-200 transition hover:border-zinc-200 hover:text-white">
              Sign In
            </button>
            <button className="hidden sm:block rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold tracking-wide text-white transition hover:bg-red-500">
              Sign Up
            </button>

            {/* Burger Menu - Mobile only */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition"
              aria-label="Menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden mt-3 rounded-lg bg-black/90 border border-zinc-800 p-4 space-y-3">
          {/* Nav Items */}
          <ul className="space-y-2 mb-4 pb-4 border-b border-zinc-800">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  className="block px-3 py-2 rounded text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
                  href={item === "Home" ? "/" : "#"}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>

          {/* Auth Buttons in Menu */}
          <div className="space-y-2">
            <button className="w-full rounded-full border border-zinc-500/70 px-4 py-2 text-xs font-semibold tracking-wide text-zinc-200 transition hover:border-zinc-200 hover:text-white hover:bg-zinc-900">
              Sign In
            </button>
            <button className="w-full rounded-full bg-red-600 px-4 py-2 text-xs font-semibold tracking-wide text-white transition hover:bg-red-500">
              Sign Up
            </button>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-zinc-800/90 transition-opacity duration-300 ${
          isScrolled ? "opacity-100" : "opacity-0"
        }`}
      />
    </header>
  );
}
