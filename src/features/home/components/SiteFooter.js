import Link from "next/link";

const footerGroups = [
  {
    title: "Browse",
    links: [
      { label: "Home", href: "/" },
      { label: "Movies", href: "/movies" },
      { label: "TV Series", href: "/tv-series" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Genres", href: "/genres" },
      { label: "Country", href: "/country" },
      { label: "Year", href: "/year" },
      { label: "Network", href: "/network" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Search", href: "/search?q=popular" },
      { label: "Watchlist", href: "/" },
      { label: "Help Center", href: "/" },
      { label: "Account", href: "/" },
    ],
  },
];

const socialLinks = ["Instagram", "X", "Facebook", "YouTube"];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-[#111111] pb-10 pt-12 text-zinc-300">
      <div className="page-container flex flex-col gap-10">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#e50914]">Flixaroo</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">A streaming-style catalog built for discovery.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-zinc-400">
              Explore movies, series, episodes, and curated collections with a premium streaming-style experience.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {socialLinks.map((label) => (
                <a
                  key={label}
                  href="#"
                  className="rounded-sm border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">{group.title}</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-zinc-300 transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/8 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Flixaroo. Built for browsing, discovery, and cinematic presentation.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/movies" className="transition hover:text-zinc-300">Movies</Link>
            <Link href="/tv-series" className="transition hover:text-zinc-300">TV Series</Link>
            <Link href="/leaderboard" className="transition hover:text-zinc-300">Leaderboard</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}