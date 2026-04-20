import { Bebas_Neue, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { HomeNavbar } from "@/features/home/components/HomeNavbar";
import { SiteFooter } from "@/features/home/components/SiteFooter";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://flixaroo.com").replace(
  /\/$/,
  ""
);

const siteName = "Flixaroo";
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://cloud.umami.is/script.js";
const umamiDomains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS;
const isUmamiEnabled = Boolean(umamiWebsiteId);

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
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#111111] text-zinc-100">
        <HomeNavbar />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
      {isUmamiEnabled && (
        <Script
          src={umamiScriptUrl}
          strategy="afterInteractive"
          data-website-id={umamiWebsiteId}
          data-domains={umamiDomains || undefined}
        />
      )}
    </html>
  );
}
