import { getHomepageData } from "@/features/home/api/getHomepageData";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://flixaroo.com").replace(
  /\/$/,
  ""
);

const SECTION_ROUTES = ["movies", "tv-series", "leaderboard", "genres", "country", "year", "network"];

function buildAbsolute(path) {
  return `${siteUrl}${path}`;
}

function uniqueByUrl(entries) {
  const map = new Map();
  entries.forEach((entry) => {
    map.set(entry.url, entry);
  });
  return [...map.values()];
}

export default async function sitemap() {
  const now = new Date();
  const staticEntries = [
    {
      url: buildAbsolute("/"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: buildAbsolute("/search"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...SECTION_ROUTES.map((section) => ({
      url: buildAbsolute(`/${section}`),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    })),
  ];

  try {
    const { rows } = await getHomepageData();
    const items = rows.flatMap((row) => row.items || []);

    const contentEntries = items
      .filter((item) => item?.id)
      .map((item) => {
        const isTV = item.contentType === "tv_series";
        const detailPath = `/movie/${item.id}-${isTV ? "show" : "movie"}`;

        return {
          url: buildAbsolute(detailPath),
          lastModified: now,
          changeFrequency: "daily",
          priority: 0.9,
        };
      });

    return uniqueByUrl([...staticEntries, ...contentEntries]);
  } catch {
    return staticEntries;
  }
}
