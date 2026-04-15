import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HomeNavbar } from "@/features/home/components/HomeNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PawPaw Streaming",
  description: "Homepage streaming-style mirip Netflix untuk proyek PawPaw.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f]">
        <HomeNavbar />
        {children}
      </body>
    </html>
  );
}
