const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

function toTitleCase(value) {
  if (!value || typeof value !== "string") return "Untitled";
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildImageUrl(path, size = "w780") {
  if (!path || typeof path !== "string") return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

function pickContent(rawItem) {
  if (!rawItem || typeof rawItem !== "object") return null;
  return rawItem.content && typeof rawItem.content === "object"
    ? rawItem.content
    : rawItem;
}

function getReleaseDate(item) {
  return item.firstAirDate ?? item.releaseDate ?? null;
}

function getYear(item) {
  const releaseDate = getReleaseDate(item);
  if (!releaseDate) return null;
  return String(releaseDate).slice(0, 4);
}

function mapGenres(item) {
  if (!Array.isArray(item.genres)) return [];
  return item.genres
    .map((genre) => (typeof genre?.name === "string" ? genre.name : null))
    .filter(Boolean);
}

function mapNetworks(item) {
  if (!Array.isArray(item.networks)) return [];

  return item.networks
    .map((network) => {
      if (typeof network === "string") return network;
      if (typeof network?.name === "string") return network.name;
      return null;
    })
    .filter(Boolean);
}

function mapCard(rawItem) {
  const item = pickContent(rawItem);
  const title = item?.title ?? item?.name ?? item?.series?.title ?? null;

  if (!item?.id || !title) return null;

  const genres = mapGenres(item);
  const networks = mapNetworks(item);
  const contentType =
    item.contentType ??
    (item.episodeNumber ? "episode" : item.runtime ? "movie" : "tv_series");
  const posterPath = item.posterPath ?? item.stillPath ?? item.series?.posterPath;
  const backdropPath = item.backdropPath ?? item.series?.backdropPath ?? null;
  const inferredSlug = item.slug ?? item.series?.slug ?? "#";

  return {
    id: item.id,
    title,
    slug: inferredSlug,
    overview: item.overview ?? "No synopsis available.",
    tagline: item.tagline ?? null,
    posterUrl: buildImageUrl(posterPath, "w500"),
    backdropUrl: buildImageUrl(backdropPath, "w1280"),
    logoUrl: buildImageUrl(item.logoPath, "w500"),
    trailerUrl: item.trailerUrl ?? null,
    releaseDate: getReleaseDate(item),
    year: getYear(item),
    rating: item.voteAverage ?? null,
    contentType,
    country: item.country ?? null,
    seasons: item.numberOfSeasons ?? null,
    runtime: item.runtime ?? null,
    status: item.status ?? null,
    commentCount: item.commentCount ?? 0,
    genres,
    networks,
    label: genres[0] ?? networks[0] ?? "Featured",
  };
}

function mapSection(section) {
  const items = Array.isArray(section?.data)
    ? section.data.map(mapCard).filter(Boolean)
    : [];

  if (items.length === 0) return null;

  return {
    id: section.id ?? section.slug ?? section.title,
    title: section.title?.trim() || toTitleCase(section.slug ?? section.type),
    type: section.type ?? "row",
    sortOrder: Number.isFinite(section.sortOrder) ? section.sortOrder : 999,
    items,
  };
}

export function mapHomepagePayload(payload) {
  const above = Array.isArray(payload?.above) ? payload.above : [];
  const below = Array.isArray(payload?.below) ? payload.below : [];

  const sections = [...above, ...below]
    .map(mapSection)
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const featuredSection = sections.find((section) => section.type === "featured");
  const fallbackSection = sections.find((section) => section.items.length > 0);
  const featured = featuredSection?.items?.[0] ?? fallbackSection?.items?.[0] ?? null;

  return {
    featured,
    rows: sections,
  };
}
