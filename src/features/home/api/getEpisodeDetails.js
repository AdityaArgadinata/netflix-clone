import { getMovieDetails } from "@/features/home/api/getMovieDetails";
import { buildImageUrl, fetchTMDB } from "@/features/home/api/tmdbClient";

export async function getEpisodeDetails(movieId, seasonNumber = 1, episodeNumber = 1) {
  const [series, episodeData] = await Promise.all([
    getMovieDetails(movieId, true),
    fetchTMDB(`/tv/${movieId}/season/${seasonNumber}/episode/${episodeNumber}`, {
      revalidate: 3600,
      cacheTtlMs: 3600 * 1000,
    }),
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