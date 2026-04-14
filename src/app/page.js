import { HomeNavbar } from "@/features/home/components/HomeNavbar";
import { HeroSection } from "@/features/home/components/HeroSection";
import { ContentRow } from "@/features/home/components/ContentRow";
import { EmptyState } from "@/features/home/components/EmptyState";
import { getHomepageData } from "@/features/home/api/getHomepageData";

export default async function Home() {
  const { featured, rows } = await getHomepageData();
  const featuredRow = rows.find((row) => row.type === "featured");
  const baseFeaturedItems =
    featuredRow?.items?.length > 0 ? featuredRow.items : featured ? [featured] : [];

  const featuredIds = new Set(baseFeaturedItems.map((item) => item.id));
  const supplementalItems = rows
    .filter((row) => row.type !== "featured")
    .flatMap((row) => row.items)
    .filter((item) => {
      if (!item?.id || featuredIds.has(item.id)) return false;
      featuredIds.add(item.id);
      return true;
    })
    .slice(0, 6);

  const featuredItems =
    baseFeaturedItems.length >= 2
      ? baseFeaturedItems
      : [...baseFeaturedItems, ...supplementalItems];
  const displayRows = rows.filter((row) => row.type !== "featured");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      <HomeNavbar />

      <main>
        <HeroSection items={featuredItems} />

        <section className="flex w-full flex-col gap-7 px-6 pb-14 sm:px-12 lg:px-16">
          {displayRows.length > 0 ? (
            displayRows.map((row) => <ContentRow key={row.id} row={row} />)
          ) : (
            <EmptyState />
          )}
        </section>
      </main>
    </div>
  );
}
