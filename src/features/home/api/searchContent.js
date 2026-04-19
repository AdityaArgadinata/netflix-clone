import { fetchTMDB } from "@/features/home/api/tmdbClient";

export async function searchContent(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const [movies, shows] = await Promise.all([
      fetchTMDB("/search/movie", {
        params: {
          query: query.trim(),
          page: "1",
          include_adult: "false",
          language: "en-US",
        },
        revalidate: 120,
        cacheTtlMs: 120 * 1000,
      }),
      fetchTMDB("/search/tv", {
        params: {
          query: query.trim(),
          page: "1",
          include_adult: "false",
          language: "en-US",
        },
        revalidate: 120,
        cacheTtlMs: 120 * 1000,
      }),
    ]);

    const results = [];

    // Add movies
    if (Array.isArray(movies.results)) {
      results.push(
        ...movies.results
          .filter((m) => m.id && m.title)
          .slice(0, 10)
          .map((m) => ({
            id: m.id,
            title: m.title,
            type: "movie",
            poster_path: m.poster_path, // Allow null - will show fallback in UI
            backdrop_path: m.backdrop_path,
            overview: m.overview,
            release_date: m.release_date,
            vote_average: m.vote_average,
            popularity: m.popularity,
          }))
      );
    }

    // Add shows
    if (Array.isArray(shows.results)) {
      results.push(
        ...shows.results
          .filter((s) => s.id && s.name)
          .slice(0, 10)
          .map((s) => ({
            id: s.id,
            title: s.name,
            type: "tv",
            poster_path: s.poster_path, // Allow null - will show fallback in UI
            backdrop_path: s.backdrop_path,
            overview: s.overview,
            first_air_date: s.first_air_date,
            vote_average: s.vote_average,
            popularity: s.popularity,
          }))
      );
    }

    // Sort by popularity + vote_average and return top 20
    const finalResults = results
      .sort((a, b) => {
        // Prioritize by popularity
        if (b.popularity !== a.popularity) {
          return b.popularity - a.popularity;
        }
        // Then by vote average
        return (b.vote_average || 0) - (a.vote_average || 0);
      })
      .slice(0, 20);
    
    return finalResults;
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
}

// Top searches - hardcoded popular searches
export const TOP_SEARCHES = [
  "Euphoria",
  "Climax",
  "Avatar",
  "Daredevil",
  "One Piece",
  "The Boys",
  "Girl",
];
