import Link from "next/link";
import { HeroSection } from "@/features/home/components/HeroSection";
import { ContentRow } from "@/features/home/components/ContentRow";
import { EmptyState } from "@/features/home/components/EmptyState";
import { getHomepageData } from "@/features/home/api/getHomepageData";

const unique = (values) => [...new Set(values.filter(Boolean))];

export async function generateMetadata() {
  const { featured, rows } = await getHomepageData();
  const allItems = rows.flatMap((row) => row.items ?? []);

  const topTitles = unique(allItems.map((item) => item.title)).slice(0, 15);
  const topGenres = unique(allItems.flatMap((item) => item.genres ?? [])).slice(0, 12);
  const topYears = unique(
    allItems
      .map((item) => item.year ?? item.releaseDate ?? null)
      .filter(Boolean)
      .map((value) => String(value).slice(0, 4))
  ).slice(0, 8);

  const featureName = featured?.title || topTitles[0] || "trending movies and TV series";
  const description = `Stream ${featureName} and explore updated collections of movies, TV series, episodes, genres, and top-rated titles in one catalog.`;

  return {
    title: "Watch Movies and TV Series Online",
    description,
    keywords: unique([
      "watch movies online",
      "watch TV series",
      "stream episodes",
      "trending movies",
      "top rated TV shows",
      ...topGenres,
      ...topYears,
      ...topTitles,
    ]),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: "Watch Movies and TV Series Online",
      description,
      url: "/",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Watch Movies and TV Series Online",
      description,
    },
  };
}

export default async function Home() {
  const { featured, rows } = await getHomepageData();
  const featuredRow = rows.find((row) => row.type === "featured");
  const baseFeaturedItems =
    featuredRow?.items?.length > 0 ? featuredRow.items : featured ? [featured] : [];

  const featuredIds = new Set(baseFeaturedItems.map((item) => item.id));
  const supplementalItems = rows
    .filter((row) => row.type !== "featured")
    .flatMap((row) => row.items)
    .filter((item) => {
      if (!item?.id || featuredIds.has(item.id)) return false;
      featuredIds.add(item.id);
      return true;
    })
    .slice(0, 6);

  const featuredItems =
    baseFeaturedItems.length >= 2
      ? baseFeaturedItems
      : [...baseFeaturedItems, ...supplementalItems];
  const displayRows = rows.filter((row) => row.type !== "featured");
  const catalogItems = [...featuredItems, ...displayRows.flatMap((row) => row.items)];

  const uniqueValues = (items) => [...new Set(items.filter(Boolean))];
  const uniqueGenres = uniqueValues(
    catalogItems.flatMap((item) => item.genres ?? []).slice(0, 30)
  );
  const uniqueCountries = uniqueValues(
    catalogItems.map((item) => item.country).flat().slice(0, 20)
  );
  const uniqueYears = uniqueValues(
    catalogItems
      .map((item) => item.year ?? item.releaseDate ?? item.firstAirDate)
      .filter(Boolean)
      .map((value) => String(value).slice(0, 4))
  );
  const uniqueNetworks = uniqueValues(
    catalogItems.flatMap((item) => item.networks ?? []).slice(0, 30)
  );

  const browseGroups = [
    { id: "genres", title: "Genres", values: uniqueGenres },
    { id: "country", title: "Country", values: uniqueCountries },
    { id: "year", title: "Year", values: uniqueYears },
    { id: "network", title: "Network", values: uniqueNetworks },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050608] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_25%),linear-gradient(180deg,rgba(6,7,11,0)_0%,rgba(6,7,11,0.8)_100%)]" />
      <main className="relative z-10">
        <HeroSection items={featuredItems} />

        <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 sm:px-12 lg:px-16">
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

          <section
            id="browse-hub"
            className="scroll-mt-28 rounded-[1.75rem] border border-white/6 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.38)] sm:p-6"
          >
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-red-400">Browse</p>
                <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Explore the library like a streaming home</h2>
              </div>
              <p className="max-w-xl text-sm text-zinc-400">
                Pilih genre, negara, tahun, atau network untuk lompat ke koleksi yang terasa seperti rak Netflix.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {browseGroups.map((group) => (
                <div key={group.id} className="rounded-2xl border border-white/6 bg-black/30 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-400">{group.title}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.values.length > 0 ? (
                      group.values.slice(0, 8).map((value) => (
                        <Link
                          key={value}
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
        </section>
      </main>
    </div>
  );
}
