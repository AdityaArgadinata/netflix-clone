import Link from "next/link";
import { EmptyState } from "@/features/home/components/EmptyState";
import { HeroSection } from "@/features/home/components/HeroSection";
import { ContentRow } from "@/features/home/components/ContentRow";

const SECTION_CONFIG = {
  movies: {
    title: "Movies",
    subtitle: "Film terbaru, populer, dan paling banyak ditonton dalam satu rak cinematic.",
  },
  "tv-series": {
    title: "TV Series",
    subtitle: "Serial panjang, drama besar, dan koleksi episode yang bisa dijelajahi terus.",
  },
  leaderboard: {
    title: "Leaderboard",
    subtitle: "Papan peringkat konten dengan rating paling tinggi dan paling layak masuk watchlist.",
  },
  genres: {
    title: "Genres",
    subtitle: "Jelajahi katalog lewat genre yang paling sering muncul di koleksi PawPaw.",
  },
  country: {
    title: "Country",
    subtitle: "Koleksi yang dipetakan berdasarkan negara produksi dan asal kontennya.",
  },
  year: {
    title: "Year",
    subtitle: "Konten yang dikelompokkan berdasarkan tahun rilis agar browsing terasa cepat.",
  },
  network: {
    title: "Network",
    subtitle: "Rangkaian serial dan judul yang berhubungan dengan network populer.",
  },
};

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getItemYear(item) {
  const releaseValue = item?.year ?? item?.releaseDate ?? item?.firstAirDate;
  return releaseValue ? String(releaseValue).slice(0, 4) : null;
}

function getUniqueItems(rows) {
  const seen = new Set();
  const items = [];

  rows.forEach((row) => {
    row.items.forEach((item) => {
      if (!item?.id || seen.has(item.id)) return;
      seen.add(item.id);
      items.push(item);
    });
  });

  return items;
}

function filterRowsByContentType(rows, contentType) {
  return rows
    .map((row) => ({
      ...row,
      items: row.items.filter((item) => item.contentType === contentType),
    }))
    .filter((row) => row.items.length > 0);
}

function sortRowsByTopRating(rows) {
  return [...rows]
    .map((row) => ({
      ...row,
      items: [...row.items].sort((a, b) => toNumber(b.rating) - toNumber(a.rating)),
    }))
    .sort((a, b) => toNumber(b.items[0]?.rating) - toNumber(a.items[0]?.rating));
}

function getHeroItems(section, featured, rows) {
  const items = getUniqueItems(rows);
  const pool = section === "movies"
    ? items.filter((item) => item.contentType === "movie")
    : section === "tv-series"
      ? items.filter((item) => item.contentType === "tv_series")
      : items;

  const orderedPool = section === "leaderboard"
    ? [...pool].sort((a, b) => toNumber(b.rating) - toNumber(a.rating))
    : [...pool].sort((a, b) => toNumber(b.rating) - toNumber(a.rating));

  return [featured, ...orderedPool].filter(Boolean).slice(0, 5);
}

function buildMetaChips(items) {
  const genres = [...new Set(items.flatMap((item) => item.genres ?? []).filter(Boolean))].slice(0, 8);
  const countries = [...new Set(items.map((item) => item.country).filter(Boolean))].slice(0, 8);
  const years = [...new Set(items.map(getItemYear).filter(Boolean))].slice(0, 8);
  const networks = [...new Set(items.flatMap((item) => item.networks ?? []).filter(Boolean))].slice(0, 8);

  return [
    { id: "genres", label: "Genres", values: genres },
    { id: "country", label: "Country", values: countries },
    { id: "year", label: "Year", values: years },
    { id: "network", label: "Network", values: networks },
  ];
}

export function SectionPage({ section, featured, rows }) {
  const config = SECTION_CONFIG[section] ?? SECTION_CONFIG.movies;
  const displayRows =
    section === "movies"
      ? filterRowsByContentType(rows, "movie")
      : section === "tv-series"
        ? filterRowsByContentType(rows, "tv_series")
        : section === "leaderboard"
          ? sortRowsByTopRating(rows)
          : rows;

  const catalogItems = getUniqueItems(displayRows);
  const heroItems = getHeroItems(section, featured, displayRows);
  const metaChips = buildMetaChips(catalogItems);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050608] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_25%),linear-gradient(180deg,rgba(6,7,11,0)_0%,rgba(6,7,11,0.8)_100%)]" />

      <main className="relative z-10">
        <HeroSection items={heroItems} />

        <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 sm:px-12 lg:px-16">
          <section className="scroll-mt-28 rounded-[1.75rem] border border-white/6 bg-white/3 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-sm sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-red-400">{config.title}</p>
                <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{config.title} Collection</h2>
              </div>
              <p className="max-w-xl text-sm text-zinc-400">{config.subtitle}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metaChips.map((group) => (
                <div key={group.id} className="rounded-2xl border border-white/6 bg-black/30 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-400">{group.label}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.values.length > 0 ? (
                      group.values.map((value) => (
                        <Link
                          key={`${group.id}-${value}`}
                          href={`/search?q=${encodeURIComponent(value)}`}
                          className="rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1.5 text-sm text-zinc-200 transition hover:border-red-500 hover:bg-red-500/10 hover:text-white"
                        >
                          {value}
                        </Link>
                      ))
                    ) : (
                      <span className="text-sm text-zinc-500">No items yet</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {displayRows.length > 0 ? (
            displayRows.map((row) => (
              <section
                key={row.id}
                id={row.id}
                className="scroll-mt-28 rounded-[1.75rem] border border-white/6 bg-white/3 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-sm sm:p-6"
              >
                <ContentRow row={row} />
              </section>
            ))
          ) : (
            <EmptyState />
          )}
        </section>
      </main>
    </div>
  );
}