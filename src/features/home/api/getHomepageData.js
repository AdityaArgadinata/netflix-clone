import { mapHomepagePayload } from "@/features/home/mappers/homeMapper";
import { fetchTMDB } from "@/features/home/api/tmdbClient";

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

function getItemKey(id, isTV = false) {
  return `${isTV ? "tv" : "movie"}-${id}`;
}

function extractCountry(detailData) {
  if (Array.isArray(detailData?.production_countries) && detailData.production_countries.length > 0) {
    const name = detailData.production_countries[0]?.name;
    if (name) return name;
  }

  if (Array.isArray(detailData?.origin_country) && detailData.origin_country.length > 0) {
    return detailData.origin_country[0] || null;
  }

  return null;
}

function extractNetworks(detailData, isTV = false) {
  if (isTV) {
    return Array.isArray(detailData?.networks)
      ? detailData.networks.filter((network) => typeof network?.name === "string")
      : [];
  }

  return Array.isArray(detailData?.production_companies)
    ? detailData.production_companies.filter((company) => typeof company?.name === "string")
    : [];
}

async function fetchItemMetadata(itemId, isTV = false) {
  try {
    const endpoint = isTV ? `/tv/${itemId}` : `/movie/${itemId}`;
    const detailData = await fetchTMDB(endpoint, {
      params: { append_to_response: "images" },
      revalidate: 3600,
      cacheTtlMs: 3600 * 1000,
    });

    let logoPath = null;
    
    if (detailData.images?.logos && detailData.images.logos.length > 0) {
      const bestLogo = detailData.images.logos
        .filter((logo) => logo.iso_639_1 === "en" || !logo.iso_639_1)
        .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))[0];
      if (bestLogo) logoPath = bestLogo.file_path;
    }

    return {
      logoPath,
      genres: Array.isArray(detailData?.genres) ? detailData.genres : [],
      country: extractCountry(detailData),
      networks: extractNetworks(detailData, isTV),
    };
  } catch (err) {
    console.error(`Failed to fetch metadata for ${itemId}:`, err);
  }

  return {
    logoPath: null,
    genres: [],
    country: null,
    networks: [],
  };
}

async function fetchHomepagePayload() {
  const [trendingMovies, trendingShows, topRatedMovies, topRatedShows] = await Promise.all([
    fetchTMDB("/trending/movie/week", { revalidate: 300, cacheTtlMs: 300 * 1000 }),
    fetchTMDB("/trending/tv/week", { revalidate: 300, cacheTtlMs: 300 * 1000 }),
    fetchTMDB("/movie/top_rated", { revalidate: 300, cacheTtlMs: 300 * 1000 }),
    fetchTMDB("/tv/top_rated", { revalidate: 300, cacheTtlMs: 300 * 1000 }),
  ]);

  // Fetch metadata for all homepage items to populate hero and browse chips.
  const allTrendingMovies = trendingMovies.results.slice(0, 10);
  const allTrendingShows = trendingShows.results.slice(0, 10);
  const allTopRatedMovies = topRatedMovies.results.slice(0, 10);
  const allTopRatedShows = topRatedShows.results.slice(0, 10);
  
  const itemsToFetchMetadata = [
    ...allTrendingMovies.map((m) => ({ id: m.id, isTV: false })),
    ...allTrendingShows.map((s) => ({ id: s.id, isTV: true })),
    ...allTopRatedMovies.map((m) => ({ id: m.id, isTV: false })),
    ...allTopRatedShows.map((s) => ({ id: s.id, isTV: true })),
  ];

  const metadataList = await Promise.all(
    itemsToFetchMetadata.map((item) =>
      item.id ? fetchItemMetadata(item.id, item.isTV) : Promise.resolve(null)
    )
  );

  const metadataMap = new Map();
  itemsToFetchMetadata.forEach((item, idx) => {
    if (item.id) {
      metadataMap.set(getItemKey(item.id, item.isTV), metadataList[idx]);
    }
  });

  // Featured item
  const featuredMovie = trendingMovies.results[0];
  const featuredMeta = featuredMovie?.id
    ? metadataMap.get(getItemKey(featuredMovie.id, false))
    : null;
  const featuredItem = {
    id: featuredMovie?.id,
    title: featuredMovie?.title,
    slug: featuredMovie?.title?.toLowerCase().replace(/\s+/g, "-"),
    overview: featuredMovie?.overview,
    tagline: featuredMovie?.tagline || null,
    posterPath: featuredMovie?.poster_path,
    backdropPath: featuredMovie?.backdrop_path,
    logoPath: featuredMeta?.logoPath || null,
    releaseDate: featuredMovie?.release_date,
    voteAverage: featuredMovie?.vote_average,
    genres: featuredMeta?.genres || [],
    country: featuredMeta?.country || null,
    networks: featuredMeta?.networks || [],
    contentType: "movie",
  };

  // Format trending movies with metadata where available.
  const trendingMoviesData = trendingMovies.results.slice(0, 10).map((movie) => {
    const formatted = formatTMDBMovie(movie);
    const itemMeta = metadataMap.get(getItemKey(movie.id, false));
    return {
      content: {
        ...formatted,
        logoPath: itemMeta?.logoPath || null,
        genres: itemMeta?.genres || [],
        country: itemMeta?.country || null,
        networks: itemMeta?.networks || [],
      },
    };
  });

  // Format trending shows with metadata where available.
  const trendingShowsData = trendingShows.results.slice(0, 10).map((show) => {
    const formatted = formatTMDBShow(show);
    const itemMeta = metadataMap.get(getItemKey(show.id, true));
    return {
      content: {
        ...formatted,
        logoPath: itemMeta?.logoPath || null,
        genres: itemMeta?.genres || [],
        country: itemMeta?.country || null,
        networks: itemMeta?.networks || [],
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
          const itemMeta = metadataMap.get(getItemKey(movie.id, false));
          return {
            content: {
              ...formatted,
              logoPath: itemMeta?.logoPath || null,
              genres: itemMeta?.genres || [],
              country: itemMeta?.country || null,
              networks: itemMeta?.networks || [],
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
          const itemMeta = metadataMap.get(getItemKey(show.id, true));
          return {
            content: {
              ...formatted,
              logoPath: itemMeta?.logoPath || null,
              genres: itemMeta?.genres || [],
              country: itemMeta?.country || null,
              networks: itemMeta?.networks || [],
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
