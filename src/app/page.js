import Link from "next/link";
import { HeroSection } from "@/features/home/components/HeroSection";
import { ContentRow } from "@/features/home/components/ContentRow";
import { EmptyState } from "@/features/home/components/EmptyState";
import { getHomepageData } from "@/features/home/api/getHomepageData";

const unique = (values) => [...new Set(values.filter(Boolean))];
const siteName = "Flixaroo";
const siteImage = "/flixaroo.jpg";
const pageTitle = "Watch Movies and TV Series Online";

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
    title: pageTitle,
    description,
    applicationName: siteName,
    keywords: unique([
      "flixaroo",
      "flixaroo.com",
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
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    category: "entertainment",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: pageTitle,
      description,
      url: "/",
      type: "website",
      siteName,
      images: [
        {
          url: siteImage,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [siteImage],
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
    <div className="relative min-h-screen overflow-hidden bg-[#111111] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,9,20,0.15),transparent_34%),linear-gradient(180deg,rgba(17,17,17,0)_0%,rgba(17,17,17,0.96)_100%)]" />
      <main className="relative z-10">
        <HeroSection items={featuredItems} />

        <section className="page-container flex flex-col gap-9 pb-16">
          {displayRows.length > 0 ? (
            displayRows.map((row) => (
              <section key={row.id} id={row.id} className="scroll-mt-28">
                <ContentRow row={row} />
              </section>
            ))
          ) : (
            <EmptyState />
          )}

          <section
            id="browse-hub"
            className="scroll-mt-28 rounded-sm border border-zinc-800 bg-[#181818] p-5 sm:p-6"
          >
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#e50914]">Browse</p>
                <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Explore by category</h2>
              </div>
              <p className="max-w-xl text-sm text-zinc-400">
                Pick a genre, country, year, or network to jump into curated collections.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {browseGroups.map((group) => (
                <div key={group.id} className="rounded-sm border border-zinc-700 bg-[#202020] p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-300">{group.title}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.values.length > 0 ? (
                      group.values.slice(0, 8).map((value) => (
                        <Link
                          key={value}
                          href={`/search?q=${encodeURIComponent(value)}`}
                          className="rounded-sm border border-zinc-600 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 transition hover:border-[#e50914] hover:text-white"
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
