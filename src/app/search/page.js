import { searchContent } from "@/features/home/api/searchContent";
import { SearchResults } from "@/features/home/components/SearchResults";

export async function generateMetadata({ searchParams }) {
  const resolvedParams = await searchParams;
  const query = (resolvedParams?.q || "").trim();

  if (!query) {
    return {
      title: "Search Movies and TV Series",
      description:
        "Search movies, TV shows, cast, genres, and episodes to discover streaming pages with detailed metadata.",
      keywords: [
        "flixaroo",
        "flixaroo.com",
        "search movies",
        "search TV shows",
        "find episode",
        "movie discovery",
        "Flixaroo search",
      ],
      alternates: {
        canonical: "/search",
      },
    };
  }

  return {
    title: `Search \"${query}\"`,
    description: `Find movies, TV series, and episodes related to ${query}. Browse matching titles and open detailed streaming pages.`,
    keywords: [
      "flixaroo",
      "flixaroo.com",
      `${query} movie`,
      `${query} TV series`,
      `${query} episode`,
      `watch ${query}`,
      `${query} streaming`,
    ],
    alternates: {
      canonical: "/search",
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({ params, searchParams }) {
  // searchParams is a Promise in Next.js 15+, must await it
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  let results = [];

  if (query.trim()) {
    try {
      results = (await searchContent(query)) || [];
    } catch (error) {
      console.error("Search error:", error);
    }
  }

  return <SearchResults query={query} results={results} />;
}
