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

  return {
    title: title ? `${title} - PawPaw Streaming` : "PawPaw Streaming",
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