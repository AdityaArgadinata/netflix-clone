"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchModal } from "@/features/home/components/SearchModal";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function HomeNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();

  // Check auth status on mount and listen for auth changes
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setLoading(false);
      setUser(null);
      return;
    }
    
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error("Error getting session:", error);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setUser(null);
        setIsUserMenuOpen(false);
        router.push("/sign-in");
        return;
      }
      await supabase.auth.signOut();
      setUser(null);
      setIsUserMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
    const handleOpenSearchShortcut = (event) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isShortcut) return;

      event.preventDefault();
      setIsSearchOpen(true);
      setIsMobileMenuOpen(false);
    };

    window.addEventListener("keydown", handleOpenSearchShortcut);
    return () => window.removeEventListener("keydown", handleOpenSearchShortcut);
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

  useEffect(() => {
    // Close user menu when clicking outside
    const handleClickOutside = (event) => {
      const userMenuButton = event.target.closest("button");
      const userMenuDropdown = event.target.closest("[data-user-menu]");
      
      if (!userMenuButton && !userMenuDropdown && isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isUserMenuOpen]);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "TV Shows", href: "/tv-series" },
    { label: "Movies", href: "/movies" },
    { label: "Top 10", href: "/leaderboard" },
    { label: "Genres", href: "/genres" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        isScrolled
          ? "bg-[#111111]"
          : "bg-linear-to-b from-black/90 to-transparent"
      }`}
    >
      <nav className="page-container">
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-4 lg:gap-8">
            <Link className="netflix-logo text-3xl leading-none text-[#e50914] sm:text-4xl" href="/">
              FLIXAROO
            </Link>

            <ul className="hidden items-center gap-5 text-sm text-zinc-300 lg:flex">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="rounded-md p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            <Link
              href="/notifications"
              className="hidden rounded-md p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white sm:inline-flex"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a6 6 0 00-6 6v3.62c0 .99-.32 1.95-.92 2.74L3.4 16.6a1 1 0 00.8 1.6h15.6a1 1 0 00.8-1.6l-1.68-2.24a4.55 4.55 0 01-.92-2.74V8a6 6 0 00-6-6zm0 20a3 3 0 002.82-2H9.18A3 3 0 0012 22z" />
              </svg>
            </Link>

            <div className="hidden items-center gap-2 sm:flex">
              {loading ? (
                <div className="text-xs text-zinc-400">Loading...</div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex h-8 w-8 items-center justify-center rounded bg-linear-to-br from-[#e50914] to-red-900 text-xs font-bold text-white transition hover:from-[#f6121d] hover:to-red-800"
                  >
                    {user.user_metadata?.full_name
                      ? user.user_metadata.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : user.email[0].toUpperCase()}
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md border border-zinc-700 bg-[#1a1a1a] shadow-lg" data-user-menu>
                      <div className="border-b border-zinc-700 px-4 py-3">
                        <p className="text-xs text-zinc-400">Logged in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="rounded border border-zinc-600 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-zinc-400 hover:text-white"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/sign-in"
                    className="rounded bg-[#e50914] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#f6121d]"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => {
                const nextMobileMenuOpen = !isMobileMenuOpen;
                setIsMobileMenuOpen(nextMobileMenuOpen);
                if (nextMobileMenuOpen) {
                  setIsUserMenuOpen(false);
                }
              }}
              className="rounded-md p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white lg:hidden"
              aria-label="Menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {isMobileMenuOpen && (
        <div className="border-t border-zinc-800/80 bg-[#111111] lg:hidden">
          <ul className="page-container space-y-1 py-4">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            <li className="mt-3 border-t border-zinc-800 pt-3">
              {loading ? (
                <div className="px-3 py-2 text-sm text-zinc-400">Loading...</div>
              ) : user ? (
                <div className="space-y-2">
                  <div className="rounded bg-zinc-900 px-3 py-2">
                    <p className="text-xs text-zinc-400">Logged in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block rounded bg-zinc-800 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-zinc-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full rounded bg-zinc-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/sign-up"
                    className="inline-flex flex-1 items-center justify-center rounded border border-zinc-600 px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-400 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/sign-in"
                    className="inline-flex flex-1 items-center justify-center rounded bg-[#e50914] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#f6121d]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-zinc-800 transition-opacity duration-300 ${
          isScrolled ? "opacity-100" : "opacity-0"
        }`}
      />
    </header>
  );
}
