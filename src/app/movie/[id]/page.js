import { MovieDetail } from "@/features/home/components/MovieDetail";
import { getMovieDetails } from "@/features/home/api/getMovieDetails";

export const metadata = {
  title: "Movie Details - PawPaw Streaming",
};

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
