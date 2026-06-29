import { buildImageUrl, fetchTMDB } from "@/features/home/api/tmdbClient";

function mapStudioPartners(data, isTV = false) {
  const networkItems = Array.isArray(data?.networks) ? data.networks : [];
  const productionItems = Array.isArray(data?.production_companies) ? data.production_companies : [];
  const sourceItems = isTV ? [...networkItems, ...productionItems] : productionItems;
  const seen = new Set();

  return sourceItems
    .map((item) => ({
      id: item?.id,
      name: item?.name,
      logoUrl: buildImageUrl(item?.logo_path, "w300"),
    }))
    .filter((item) => item.name && item.logoUrl)
    .filter((item) => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    })
    .slice(0, 10);
}

function mapEpisode(episode) {
  return {
    id: episode.id,
    episodeNumber: episode.episode_number,
    seasonNumber: episode.season_number,
    title: episode.name,
    overview: episode.overview,
    stillPath: episode.still_path,
    stillUrl: buildImageUrl(episode.still_path, "w500"),
    airDate: episode.air_date,
    rating: episode.vote_average,
    runtime: episode.runtime,
  };
}

export async function getMovieDetails(movieId, isTV = false) {
  const endpoint = isTV ? `/tv/${movieId}` : `/movie/${movieId}`;
  
  try {
    const data = await fetchTMDB(endpoint, {
      params: { append_to_response: "credits,images" },
      revalidate: 3600,
      cacheTtlMs: 3600 * 1000,
    });

    let logoUrl = null;
    if (data.images?.logos && data.images.logos.length > 0) {
      const bestLogo = data.images.logos
        .filter((logo) => logo.iso_639_1 === "en" || !logo.iso_639_1)
        .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))[0];
      if (bestLogo) {
        logoUrl = buildImageUrl(bestLogo.file_path, "w500");
      }
    }
    
    let episodes = [];
    let episodesBySeason = {};
    const seasonSummaries = isTV && Array.isArray(data.seasons)
      ? data.seasons
          .filter((season) => season.season_number > 0 && season.episode_count > 0)
          .map((season) => ({
            id: season.id,
            name: season.name,
            seasonNumber: season.season_number,
            episodeCount: season.episode_count,
            airDate: season.air_date,
          }))
      : [];

    if (seasonSummaries.length > 0) {
      const seasonResults = await Promise.allSettled(
        seasonSummaries.map((season) =>
          fetchTMDB(`/tv/${movieId}/season/${season.seasonNumber}`, {
            revalidate: 3600,
            cacheTtlMs: 3600 * 1000,
          })
        )
      );

      episodesBySeason = seasonResults.reduce((acc, result, index) => {
        const seasonNumber = seasonSummaries[index].seasonNumber;

        if (result.status !== "fulfilled") {
          console.error(`Failed to fetch season ${seasonNumber} for ${movieId}:`, result.reason);
          acc[seasonNumber] = [];
          return acc;
        }

        acc[seasonNumber] = Array.isArray(result.value.episodes)
          ? result.value.episodes.map(mapEpisode)
          : [];
        return acc;
      }, {});

      episodes = episodesBySeason[seasonSummaries[0].seasonNumber] || [];
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
      seasonSummaries,
      studioPartners: mapStudioPartners(data, isTV),
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
      episodesBySeason,
    };
  } catch (error) {
    console.error(`Failed to fetch details for ${movieId}:`, error);
    throw error;
  }
}
