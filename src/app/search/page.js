import { searchContent } from "@/features/home/api/searchContent";
import { SearchResults } from "@/features/home/components/SearchResults";

export const metadata = {
  title: "Search Results - PawPaw Streaming",
};

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
