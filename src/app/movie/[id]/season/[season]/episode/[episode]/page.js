import { EpisodeDetail } from "@/features/home/components/EpisodeDetail";
import { getEpisodeDetails } from "@/features/home/api/getEpisodeDetails";

function buildEpisodeDescription(series, episode) {
  const episodeName = episode.title || `Episode ${episode.episodeNumber}`;
  const fallback = `Watch ${series.title} season ${episode.seasonNumber} episode ${episode.episodeNumber}.`;
  return `${series.title} - ${episodeName}. ${episode.overview || fallback}`.slice(0, 160);
}

export async function generateMetadata({ params }) {
  const { id, season, episode } = await params;
  const parts = id.split("-");
  const movieId = parts[0];
  const type = parts.slice(1).join("-");
  const isTV = type === "show" || type === "tv";

  if (!isTV) {
    return {
      title: "Episode Not Available",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  try {
    const payload = await getEpisodeDetails(parseInt(movieId, 10), parseInt(season, 10), parseInt(episode, 10));
    const series = payload.series;
    const currentEpisode = payload.episode;
    const episodeName = currentEpisode.title || `Episode ${currentEpisode.episodeNumber}`;
    const canonical = `/movie/${series.id}-show/season/${currentEpisode.seasonNumber}/episode/${currentEpisode.episodeNumber}`;
    const description = buildEpisodeDescription(series, currentEpisode);

    return {
      title: `${series.title} S${currentEpisode.seasonNumber}E${currentEpisode.episodeNumber} - ${episodeName}`,
      description,
      keywords: [
        `${series.title} season ${currentEpisode.seasonNumber}`,
        `${series.title} episode ${currentEpisode.episodeNumber}`,
        `${episodeName} streaming`,
        `${series.title} cast`,
        ...(series.genres || []),
      ],
      alternates: {
        canonical,
      },
      openGraph: {
        title: `${series.title} S${currentEpisode.seasonNumber}E${currentEpisode.episodeNumber}`,
        description,
        url: canonical,
        type: "video.episode",
        images: (currentEpisode.stillUrl || series.backdropUrl)
          ? [
              {
                url: currentEpisode.stillUrl || series.backdropUrl,
                alt: `${series.title} ${episodeName}`,
              },
            ]
          : undefined,
      },
      twitter: {
        card: currentEpisode.stillUrl || series.backdropUrl ? "summary_large_image" : "summary",
        title: `${series.title} S${currentEpisode.seasonNumber}E${currentEpisode.episodeNumber}`,
        description,
      },
    };
  } catch {
    return {
      title: "Episode Details",
      description: "Explore episode details, synopsis, and cast.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

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