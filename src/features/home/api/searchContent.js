const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function fetchTMDB(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  
  // Add required params
  url.searchParams.append("api_key", TMDB_API_KEY);
  url.searchParams.append("include_adult", "false");
  url.searchParams.append("language", "en-US");
  
  // Add custom params
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: { 
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[fetchTMDB] Error response:", errorText);
    throw new Error(`TMDB API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}

export async function searchContent(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const [movies, shows] = await Promise.all([
      fetchTMDB("/search/movie", { query: query.trim(), page: "1" }),
      fetchTMDB("/search/tv", { query: query.trim(), page: "1" }),
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
