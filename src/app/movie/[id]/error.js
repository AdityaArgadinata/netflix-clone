"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function MovieErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error("Error loading movie details:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Movie Not Found</h1>
        <p className="text-zinc-400 mb-6">Sorry, we couldn&apos;t load the details for this movie.</p>
        <Link href="/" className="px-6 py-2 bg-white text-black rounded font-bold hover:bg-gray-200 transition inline-block">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
