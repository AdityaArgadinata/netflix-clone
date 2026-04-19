import Link from "next/link";

export const metadata = {
  title: "Notifications",
  description: "View your latest watch and account notifications on Flixaroo.",
  alternates: {
    canonical: "/notifications",
  },
};

const sampleNotification = {
  id: "notif-1",
  category: "System Update",
  title: "Flixaroo v2.8.0 is now live",
  message:
    "A new version is available with faster search results, improved subtitle sync, and a smoother homepage browsing experience.",
  time: "Just now",
};

const tabs = [
  { id: "system", label: "System" },
  { id: "inbox", label: "Inbox" },
  { id: "film-update", label: "Update Film" },
];

const tabContent = {
  system: {
    helperText: "System notifications include app updates, maintenance info, and new version announcements.",
    notification: sampleNotification,
    ctaLabel: "Read update",
    ctaHref: "/search?q=Flixaroo%20update",
  },
  inbox: {
    helperText: "Inbox notifications include account messages and personalized reminders.",
    notification: {
      id: "notif-2",
      category: "Inbox",
      title: "Your watchlist is waiting",
      message:
        "You saved 3 titles this week. Continue where you left off and discover similar recommendations.",
      time: "2 hours ago",
    },
    ctaLabel: "Open watchlist",
    ctaHref: "/search?q=watchlist",
  },
  "film-update": {
    helperText: "Film updates include new releases, new episodes, and trending title drops.",
    notification: {
      id: "notif-3",
      category: "Film Update",
      title: "Midnight Echo is now streaming",
      message:
        "A new thriller just landed in the catalog with Dolby Atmos audio and multi-language subtitles.",
      time: "5 minutes ago",
    },
    ctaLabel: "Watch now",
    ctaHref: "/search?q=Midnight%20Echo",
  },
};

export default async function NotificationsPage({ searchParams }) {
  const params = await searchParams;
  const requestedTab = params?.tab;
  const activeTab = tabs.some((tab) => tab.id === requestedTab) ? requestedTab : "system";
  const activeContent = tabContent[activeTab];

  return (
    <div className="min-h-screen bg-[#111111] pt-28 text-zinc-100 sm:pt-32">
      <main className="page-container pb-16">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#e50914]">
              Inbox
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Notifications</h1>
          </div>
          <Link
            href="/"
            className="rounded-sm border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Back to Home
          </Link>
        </header>

        <section className="rounded-sm border border-zinc-800 bg-[#181818] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] sm:p-6">
          <div className="mb-5 flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <Link
                  key={tab.id}
                  href={`/notifications?tab=${encodeURIComponent(tab.id)}`}
                  className={`rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] transition ${
                    isActive
                      ? "border-[#e50914] bg-[#e50914] text-white"
                      : "border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:border-zinc-500 hover:text-white"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-300">Latest</h2>
            <span className="text-xs text-zinc-500">1 message</span>
          </div>

          <p className="mb-4 text-xs text-zinc-500 sm:text-sm">
            {activeContent.helperText}
          </p>

          <article className="group rounded-sm border border-zinc-700 bg-linear-to-r from-[#1f1f1f] to-[#181818] p-4 transition hover:border-[#e50914] hover:shadow-[0_0_0_1px_rgba(229,9,20,0.15)] sm:p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-sm bg-[#e50914] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                {activeContent.notification.category}
              </span>
              <span className="text-xs text-zinc-500">{activeContent.notification.time}</span>
            </div>

            <h3 className="text-lg font-semibold text-white sm:text-xl">{activeContent.notification.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-300">{activeContent.notification.message}</p>

            <div className="mt-4">
              <Link
                href={activeContent.ctaHref}
                className="inline-flex items-center gap-2 rounded-sm bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                <span>{activeContent.ctaLabel}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
