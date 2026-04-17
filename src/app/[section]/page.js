import { notFound } from "next/navigation";
import { getHomepageData } from "@/features/home/api/getHomepageData";
import { SectionPage } from "@/features/home/components/SectionPage";

const SECTION_TITLES = {
  movies: "Movies",
  "tv-series": "TV Series",
  leaderboard: "Leaderboard",
  genres: "Genres",
  country: "Country",
  year: "Year",
  network: "Network",
};

export async function generateMetadata({ params }) {
  const { section } = await params;
  const title = SECTION_TITLES[section];
  const sectionLabel = title || "Catalog";
  const normalizedSection = sectionLabel.toLowerCase();

  return {
    title: title || "Catalog",
    description: `Browse ${normalizedSection} collections, discover related titles, and open complete movie and TV detail pages with streaming links.`,
    keywords: [
      `${normalizedSection} movies`,
      `${normalizedSection} TV series`,
      `${normalizedSection} streaming`,
      `${normalizedSection} catalog`,
      `watch ${normalizedSection}`,
      "PawPaw Streaming",
    ],
    alternates: {
      canonical: title ? `/${section}` : "/",
    },
    openGraph: {
      title: `${sectionLabel} | PawPaw Streaming`,
      description: `Explore ${normalizedSection} and discover movies and TV series in one page.`,
      url: title ? `/${section}` : "/",
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(SECTION_TITLES).map((section) => ({ section }));
}

export default async function SectionRoutePage({ params }) {
  const { section } = await params;

  if (!SECTION_TITLES[section]) {
    notFound();
  }

  const { featured, rows } = await getHomepageData();

  return <SectionPage section={section} featured={featured} rows={rows} />;
}