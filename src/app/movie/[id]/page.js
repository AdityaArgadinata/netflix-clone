import { MovieDetail } from "@/features/home/components/MovieDetail";
import { getMovieDetails } from "@/features/home/api/getMovieDetails";

function buildDescription(movie, isTV) {
  const year = movie.releaseDate ? String(movie.releaseDate).slice(0, 4) : null;
  const typeLabel = isTV ? "TV series" : "movie";
  const base = movie.overview || movie.tagline || `Watch ${movie.title} online.`;
  return `${movie.title}${year ? ` (${year})` : ""} is a ${typeLabel}. ${base}`.slice(0, 160);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const parts = id.split("-");
  const movieId = parts[0];
  const type = parts.slice(1).join("-");
  const isTV = type === "show" || type === "tv";

  try {
    const movie = await getMovieDetails(parseInt(movieId, 10), isTV);
    const year = movie.releaseDate ? String(movie.releaseDate).slice(0, 4) : "";
    const canonical = `/movie/${movie.id}-${isTV ? "show" : "movie"}`;
    const title = `${movie.title}${year ? ` (${year})` : ""}`;
    const description = buildDescription(movie, isTV);

    return {
      title,
      description,
      keywords: [
        "flixaroo",
        "flixaroo.com",
        `${movie.title} ${isTV ? "TV series" : "movie"}`,
        `watch ${movie.title} online`,
        `${movie.title} cast`,
        `${movie.title} synopsis`,
        ...(movie.genres || []),
        ...(movie.productionCountries || []),
      ],
      alternates: {
        canonical,
      },
      openGraph: {
        title: `${title} | Flixaroo`,
        description,
        url: canonical,
        type: isTV ? "video.tv_show" : "video.movie",
        images: movie.backdropUrl
          ? [
              {
                url: movie.backdropUrl,
                alt: movie.title,
              },
            ]
          : undefined,
      },
      twitter: {
        card: movie.backdropUrl ? "summary_large_image" : "summary",
        title: `${title} | Flixaroo`,
        description,
        images: movie.backdropUrl ? [movie.backdropUrl] : undefined,
      },
    };
  } catch {
    return {
      title: "Movie Details",
      description: "Explore movie and TV detail pages with synopsis, cast, and episode information.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function MoviePage({ params }) {
  const { id } = await params;
  // Format: "123-movie" or "456-show"
  const parts = id.split("-");
  const movieId = parts[0];
  const type = parts.slice(1).join("-");
  const isTV = type === "show" || type === "tv";

  const movie = await getMovieDetails(parseInt(movieId), isTV);
  return <MovieDetail movie={movie} />;
}
