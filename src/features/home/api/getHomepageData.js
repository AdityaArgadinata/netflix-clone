import { mapHomepagePayload } from "@/features/home/mappers/homeMapper";

const HOMEPAGE_API_URL = "https://z1.idlixku.com/api/homepage";

async function fetchHomepagePayload() {
  const response = await fetch(HOMEPAGE_API_URL, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch homepage API: ${response.status}`);
  }

  return response.json();
}

export async function getHomepageData() {
  try {
    const livePayload = await fetchHomepagePayload();
    return mapHomepagePayload(livePayload);
  } catch {
    return {
      featured: null,
      rows: [],
    };
  }
}
