import { mapHomepagePayload } from "@/features/home/mappers/homeMapper";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function fetchTMDB(endpoint) {
  const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch TMDB API: ${response.status}`);
  }

  return response.json();
}

function formatTMDBMovie(movie) {
  return {
    id: movie.id,
    title: movie.title,
    slug: movie.title.toLowerCase().replace(/\s+/g, "-"),
    overview: movie.overview,
    tagline: movie.tagline || null,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseDate: movie.release_date,
    voteAverage: movie.vote_average,
    contentType: "movie",
  };
}

function formatTMDBShow(show) {
  return {
    id: show.id,
    title: show.name,
    slug: show.name.toLowerCase().replace(/\s+/g, "-"),
    overview: show.overview,
    tagline: show.tagline || null,
    posterPath: show.poster_path,
    backdropPath: show.backdrop_path,
    firstAirDate: show.first_air_date,
    voteAverage: show.vote_average,
    contentType: "tv_series",
  };
}

async function fetchItemLogo(itemId, isTV = false) {
  try {
    const endpoint = isTV ? `/tv/${itemId}` : `/movie/${itemId}`;
    const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&append_to_response=images`;
    const detailData = await fetch(url).then(r => r.json());
    
    if (detailData.images?.logos && detailData.images.logos.length > 0) {
      const bestLogo = detailData.images.logos
        .filter(logo => logo.iso_639_1 === 'en' || !logo.iso_639_1)
        .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))[0];
      if (bestLogo) return bestLogo.file_path;
    }
  } catch (err) {
    console.error(`Failed to fetch logo for ${itemId}:`, err);
  }
  return null;
}

async function fetchHomepagePayload() {
  const [trendingMovies, trendingShows, topRatedMovies, topRatedShows] = await Promise.all([
    fetchTMDB("/trending/movie/week"),
    fetchTMDB("/trending/tv/week"),
    fetchTMDB("/movie/top_rated"),
    fetchTMDB("/tv/top_rated"),
  ]);

  // Fetch logos for all trending items to display in hero carousel and rows
  const allTrendingMovies = trendingMovies.results.slice(0, 10);
  const allTrendingShows = trendingShows.results.slice(0, 10);
  const allTopRatedMovies = topRatedMovies.results.slice(0, 10);
  const allTopRatedShows = topRatedShows.results.slice(0, 10);
  
  const itemsToFetchLogos = [
    ...allTrendingMovies.map(m => ({ id: m.id, isTV: false })),
    ...allTrendingShows.map(s => ({ id: s.id, isTV: true })),
    ...allTopRatedMovies.map(m => ({ id: m.id, isTV: false })),
    ...allTopRatedShows.map(s => ({ id: s.id, isTV: true })),
  ];

  const logos = await Promise.all(
    itemsToFetchLogos.map(item => item.id ? fetchItemLogo(item.id, item.isTV) : Promise.resolve(null))
  );

  const logoMap = new Map();
  itemsToFetchLogos.forEach((item, idx) => {
    if (item.id) logoMap.set(item.id, logos[idx]);
  });

  // Featured item
  const featuredMovie = trendingMovies.results[0];
  const featuredItem = {
    id: featuredMovie?.id,
    title: featuredMovie?.title,
    slug: featuredMovie?.title?.toLowerCase().replace(/\s+/g, "-"),
    overview: featuredMovie?.overview,
    tagline: featuredMovie?.tagline || null,
    posterPath: featuredMovie?.poster_path,
    backdropPath: featuredMovie?.backdrop_path,
    logoPath: logoMap.get(featuredMovie?.id),
    releaseDate: featuredMovie?.release_date,
    voteAverage: featuredMovie?.vote_average,
    contentType: "movie",
  };

  // Format trending movies with logos where available
  const trendingMoviesData = trendingMovies.results.slice(0, 10).map((movie) => {
    const formatted = formatTMDBMovie(movie);
    const logo = logoMap.get(movie.id);
    return {
      content: {
        ...formatted,
        logoPath: logo,
      },
    };
  });

  // Format trending shows with logos where available
  const trendingShowsData = trendingShows.results.slice(0, 10).map((show) => {
    const formatted = formatTMDBShow(show);
    const logo = logoMap.get(show.id);
    return {
      content: {
        ...formatted,
        logoPath: logo,
      },
    };
  });

  return {
    above: [
      {
        id: "featured",
        type: "featured",
        title: "Featured",
        slug: "featured",
        sortOrder: 0,
        data: [{ content: featuredItem }],
      },
      {
        id: "trending-movies",
        type: "row",
        title: "Trending Movies",
        slug: "trending-movies",
        sortOrder: 1,
        data: trendingMoviesData,
      },
      {
        id: "trending-shows",
        type: "row",
        title: "Trending TV Shows",
        slug: "trending-shows",
        sortOrder: 2,
        data: trendingShowsData,
      },
    ],
    below: [
      {
        id: "top-rated-movies",
        type: "row",
        title: "Top Rated Movies",
        slug: "top-rated-movies",
        sortOrder: 3,
        data: allTopRatedMovies.map((movie) => {
          const formatted = formatTMDBMovie(movie);
          const logo = logoMap.get(movie.id);
          return {
            content: {
              ...formatted,
              logoPath: logo,
            },
          };
        }),
      },
      {
        id: "top-rated-shows",
        type: "row",
        title: "Top Rated TV Shows",
        slug: "top-rated-shows",
        sortOrder: 4,
        data: allTopRatedShows.map((show) => {
          const formatted = formatTMDBShow(show);
          const logo = logoMap.get(show.id);
          return {
            content: {
              ...formatted,
              logoPath: logo,
            },
          };
        }),
      },
    ],
  };
}

export async function getHomepageData() {
  try {
    const livePayload = await fetchHomepagePayload();
    return mapHomepagePayload(livePayload);
  } catch {
    return {
      featured: null,
      rows: [],
    };
  }
}
