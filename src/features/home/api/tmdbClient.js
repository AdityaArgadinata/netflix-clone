const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const DEFAULT_REVALIDATE_SECONDS = 300;

const tmdbCacheStore = globalThis.__tmdbCacheStore || new Map();
const tmdbPendingStore = globalThis.__tmdbPendingStore || new Map();

globalThis.__tmdbCacheStore = tmdbCacheStore;
globalThis.__tmdbPendingStore = tmdbPendingStore;

function buildTmdbUrl(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  if (!TMDB_API_KEY) {
    throw new Error("Missing NEXT_PUBLIC_TMDB_API_KEY environment variable.");
  }

  url.searchParams.set("api_key", TMDB_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

function createCacheKey(endpoint, params) {
  const sortedParams = Object.entries(params || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return `${endpoint}?${JSON.stringify(sortedParams)}`;
}

async function fetchWithRetry(url, revalidate, retries = 1) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    next: { revalidate },
  });

  if (response.status !== 429 || retries <= 0) {
    return response;
  }

  const retryAfterSeconds = Number(response.headers.get("retry-after")) || 1;
  await new Promise((resolve) => setTimeout(resolve, retryAfterSeconds * 1000));
  return fetchWithRetry(url, revalidate, retries - 1);
}

export async function fetchTMDB(
  endpoint,
  {
    params = {},
    revalidate = DEFAULT_REVALIDATE_SECONDS,
    cacheTtlMs = revalidate * 1000,
    retries = 1,
  } = {}
) {
  const cacheKey = createCacheKey(endpoint, params);
  const now = Date.now();
  const cached = tmdbCacheStore.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const pending = tmdbPendingStore.get(cacheKey);
  if (pending) {
    return pending;
  }

  const promise = (async () => {
    const url = buildTmdbUrl(endpoint, params);
    const response = await fetchWithRetry(url, revalidate, retries);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TMDB API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    tmdbCacheStore.set(cacheKey, {
      data,
      expiresAt: Date.now() + cacheTtlMs,
    });

    return data;
  })();

  tmdbPendingStore.set(cacheKey, promise);

  try {
    return await promise;
  } finally {
    tmdbPendingStore.delete(cacheKey);
  }
}

export function buildImageUrl(path, size = "w780") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
