import { MovieDetail } from "@/features/home/components/MovieDetail";
import { getMovieDetails } from "@/features/home/api/getMovieDetails";
import { buildContentPath, parseContentParam } from "@/lib/routing/contentPath";

function buildDescription(movie, isTV) {
  const year = movie.releaseDate ? String(movie.releaseDate).slice(0, 4) : null;
  const typeLabel = isTV ? "TV series" : "movie";
  const base = movie.overview || movie.tagline || `Watch ${movie.title} online.`;
  return `${movie.title}${year ? ` (${year})` : ""} is a ${typeLabel}. ${base}`.slice(0, 160);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { movieId, isTV, isValidId } = parseContentParam(id);

  if (!isValidId) {
    return {
      title: "Movie Details",
      description: "Explore movie and TV detail pages with synopsis, cast, and episode information.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  try {
    const movie = await getMovieDetails(movieId, isTV);
    const year = movie.releaseDate ? String(movie.releaseDate).slice(0, 4) : "";
    const canonical = buildContentPath({ id: movie.id, title: movie.title, type: isTV ? "show" : "movie" });
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
  const { movieId, isTV, isValidId } = parseContentParam(id);

  if (!isValidId) {
    throw new Error("Invalid content URL");
  }

  const movie = await getMovieDetails(movieId, isTV);
  return <MovieDetail movie={movie} />;
}
