const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

import { getMovieDetails } from "@/features/home/api/getMovieDetails";

async function fetchTMDB(endpoint) {
  const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}`;
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

export async function getEpisodeDetails(movieId, seasonNumber = 1, episodeNumber = 1) {
  const [series, episodeData] = await Promise.all([
    getMovieDetails(movieId, true),
    fetchTMDB(`/tv/${movieId}/season/${seasonNumber}/episode/${episodeNumber}`),
  ]);

  return {
    series,
    episode: {
      id: episodeData.id,
      seasonNumber: episodeData.season_number,
      episodeNumber: episodeData.episode_number,
      title: episodeData.name,
      overview: episodeData.overview,
      stillPath: episodeData.still_path,
      stillUrl: buildImageUrl(episodeData.still_path, "w780"),
      airDate: episodeData.air_date,
      rating: episodeData.vote_average,
      runtime: episodeData.runtime,
      cast: Array.isArray(episodeData.guest_stars)
        ? episodeData.guest_stars.map((guest) => ({
            id: guest.id,
            name: guest.name,
            character: guest.character,
            profile_path: guest.profile_path,
          }))
        : [],
      crew: Array.isArray(episodeData.crew)
        ? episodeData.crew.map((member) => ({
            id: member.id,
            name: member.name,
            job: member.job,
            department: member.department,
            profilePath: member.profile_path,
          }))
        : [],
    },
  };
}