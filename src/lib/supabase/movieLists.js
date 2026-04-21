import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MOVIE_LISTS_TABLE = "movie_lists";

export function isMovieListsTableMissing(error) {
  return Boolean(error) && (error.code === "42P01" || /movie_lists/i.test(error.message || ""));
}

function resolveContentType(content) {
  if (content?.contentType) return content.contentType;
  if (content?.seasons) return "tv_series";
  return "movie";
}

export function buildMovieListPayload(content, listType, user) {
  return {
    user_id: user.id,
    movie_id: Number(content.id),
    movie_title: content.title || content.name || "Untitled",
    movie_type: resolveContentType(content),
    list_type: listType,
    poster_url: content.posterUrl || null,
    backdrop_url: content.backdropUrl || null,
  };
}

export async function fetchMovieListState(contentId, userId) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase || !userId) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from(MOVIE_LISTS_TABLE)
    .select("list_type")
    .eq("movie_id", Number(contentId))
    .eq("user_id", userId);

  if (isMovieListsTableMissing(error)) {
    return { data: [], error };
  }

  return { data: Array.isArray(data) ? data : [], error };
}

export async function toggleMovieListItem(content, listType, user) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return { error: new Error("Supabase client is not available.") };
  }

  const movieId = Number(content.id);
  const payload = buildMovieListPayload(content, listType, user);

  const { data: existingRows, error: fetchError } = await supabase
    .from(MOVIE_LISTS_TABLE)
    .select("id, list_type")
    .eq("movie_id", movieId)
    .eq("user_id", user.id)
    .eq("list_type", listType)
    .maybeSingle();

  if (isMovieListsTableMissing(fetchError)) {
    return { error: fetchError, tableMissing: true };
  }

  if (fetchError && fetchError.code !== "PGRST116") {
    return { error: fetchError };
  }

  if (existingRows?.id) {
    const { error } = await supabase
      .from(MOVIE_LISTS_TABLE)
      .delete()
      .eq("id", existingRows.id);

    if (isMovieListsTableMissing(error)) {
      return { error, tableMissing: true };
    }

    return { error: error || null, isActive: false };
  }

  const { error } = await supabase.from(MOVIE_LISTS_TABLE).upsert([payload], {
    onConflict: "user_id,movie_id,list_type",
  });

  if (isMovieListsTableMissing(error)) {
    return { error, tableMissing: true };
  }

  return { error: error || null, isActive: true };
}

export async function fetchUserMovieLists(userId) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase || !userId) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from(MOVIE_LISTS_TABLE)
    .select("movie_id, movie_title, movie_type, list_type, poster_url, backdrop_url, created_at")
    .eq("user_id", userId)
    .in("list_type", ["watchlist", "favorite"])
    .order("created_at", { ascending: false });

  if (isMovieListsTableMissing(error)) {
    return { data: [], error };
  }

  return { data: Array.isArray(data) ? data : [], error };
}