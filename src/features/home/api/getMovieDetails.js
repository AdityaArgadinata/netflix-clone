const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function fetchTMDB(endpoint) {
  const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch TMDB API: ${response.status}`);
  }

  return response.json();
}

function buildImageUrl(path, size = "w780") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export async function getMovieDetails(movieId, isTV = false) {
  const endpoint = isTV ? `/tv/${movieId}` : `/movie/${movieId}`;
  
  try {
    const data = await fetchTMDB(endpoint);
    
    // Fetch images to get logo
    let logoUrl = null;
    try {
      const imageEndpoint = isTV ? `/tv/${movieId}/images` : `/movie/${movieId}/images`;
      const imagesData = await fetch(`${TMDB_BASE_URL}${imageEndpoint}?api_key=${TMDB_API_KEY}`).then(r => r.json());
      
      if (imagesData.logos && imagesData.logos.length > 0) {
        const bestLogo = imagesData.logos
          .filter(logo => logo.iso_639_1 === 'en' || !logo.iso_639_1)
          .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))[0];
        if (bestLogo) logoUrl = buildImageUrl(bestLogo.file_path, "w500");
      }
    } catch (err) {
      console.error(`Failed to fetch images for ${movieId}:`, err);
    }
    
    let episodes = [];
    // Fetch episodes for TV series
    if (isTV && data.seasons?.length > 0) {
      try {
        const seasonData = await fetchTMDB(`/tv/${movieId}/season/1`);
        episodes = seasonData.episodes?.map(ep => ({
          id: ep.id,
          episodeNumber: ep.episode_number,
          seasonNumber: ep.season_number,
          title: ep.name,
          overview: ep.overview,
          stillPath: ep.still_path,
          stillUrl: buildImageUrl(ep.still_path, "w500"),
          airDate: ep.air_date,
          rating: ep.vote_average,
        })) || [];
      } catch (err) {
        console.error(`Failed to fetch episodes for ${movieId}:`, err);
      }
    }
    
    return {
      id: data.id,
      title: data.title || data.name,
      overview: data.overview,
      tagline: data.tagline || null,
      posterUrl: buildImageUrl(data.poster_path, "w500"),
      backdropUrl: buildImageUrl(data.backdrop_path, "w1280"),
      logoUrl,
      rating: data.vote_average,
      releaseDate: data.release_date || data.first_air_date,
      runtime: data.runtime,
      seasons: data.number_of_seasons,
      genres: Array.isArray(data.genres) ? data.genres.map(g => g.name) : [],
      popularity: data.popularity,
      contentType: isTV ? "tv_series" : "movie",
      status: data.status,
      productionCountries: Array.isArray(data.production_countries) 
        ? data.production_countries.map(c => c.name) 
        : [],
      networks: Array.isArray(data.networks) 
        ? data.networks.map(n => n.name) 
        : [],
      creators: Array.isArray(data.created_by)
        ? data.created_by.map(c => c.name)
        : [],
      cast: data.credits?.cast?.slice(0, 12) || [],
      crew: data.credits?.crew?.map(member => ({
        id: member.id,
        name: member.name,
        job: member.job,
        department: member.department,
        profilePath: member.profile_path,
      })) || [],
      episodes,
    };
  } catch (error) {
    console.error(`Failed to fetch details for ${movieId}:`, error);
    throw error;
  }
}
