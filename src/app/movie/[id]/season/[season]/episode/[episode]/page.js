import { EpisodeDetail } from "@/features/home/components/EpisodeDetail";
import { getEpisodeDetails } from "@/features/home/api/getEpisodeDetails";

export const metadata = {
  title: "Episode Details - PawPaw Streaming",
};

export default async function EpisodePage({ params }) {
  const { id, season, episode } = await params;
  const parts = id.split("-");
  const movieId = parts[0];
  const type = parts.slice(1).join("-");
  const isTV = type === "show" || type === "tv";

  if (!isTV) {
    throw new Error("Episode details are only available for TV series.");
  }

  const { series, episode: episodeDetails } = await getEpisodeDetails(
    parseInt(movieId),
    parseInt(season),
    parseInt(episode)
  );

  return <EpisodeDetail series={series} episode={episodeDetails} />;
}