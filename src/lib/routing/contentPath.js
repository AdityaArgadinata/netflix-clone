export function slugifyContentTitle(value) {
  const base = String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return base || "title";
}

export function buildContentPath({ id, title, type }) {
  const contentType = type === "show" || type === "tv" ? "show" : "movie";
  const slug = slugifyContentTitle(title);
  return `/movie/${id}-${slug}-${contentType}`;
}

export function buildEpisodePath({ id, title, season, episode }) {
  const slug = slugifyContentTitle(title);
  return `/movie/${id}-${slug}-show/season/${season}/episode/${episode}`;
}

export function parseContentParam(value) {
  const parts = String(value || "").split("-").filter(Boolean);
  const movieId = Number.parseInt(parts[0], 10);
  const type = parts[parts.length - 1] || "";

  return {
    movieId,
    type,
    isTV: type === "show" || type === "tv",
    isValidId: Number.isFinite(movieId),
  };
}
