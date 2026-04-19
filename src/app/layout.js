import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HomeNavbar } from "@/features/home/components/HomeNavbar";
import { SiteFooter } from "@/features/home/components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://flixaroo.com").replace(
  /\/$/,
  ""
);

const siteName = "Flixaroo";
const defaultDescription =
  "Watch trending movies, TV series, and episodes on Flixaroo with fast streaming links, detailed synopses, cast info, and curated genre collections.";
const defaultKeywords = [
  "flixaroo",
  "flixaroo.com",
  "streaming movies",
  "watch TV series online",
  "latest movies",
  "trending TV shows",
  "movie detail page",
  "episode streaming",
  "top rated films",
  "online cinema catalog",
  "Flixaroo",
];

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: "%s | Flixaroo",
  },
  description: defaultDescription,
  applicationName: siteName,
  keywords: defaultKeywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName,
    title: siteName,
    description: defaultDescription,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  category: "entertainment",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f]">
        <HomeNavbar />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
