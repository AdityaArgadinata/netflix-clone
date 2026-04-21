"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PosterCard } from "@/features/home/components/PosterCard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchUserMovieLists } from "@/lib/supabase/movieLists";

const LIST_SECTIONS = [
  {
    key: "watchlist",
    title: "Watchlist",
    subtitle: "Continue the night with titles you already saved.",
    accent: "from-[#e50914] to-red-900",
  },
  {
    key: "favorite",
    title: "Favourite",
    subtitle: "Your personal set of must-watch titles.",
    accent: "from-amber-500 to-orange-600",
  },
];

function normalizeListItem(item) {
  const contentType = item.movie_type === "tv_series" ? "show" : "movie";

  return {
    id: item.movie_id,
    title: item.movie_title,
    contentType,
    posterUrl: item.poster_url,
    backdropUrl: item.backdrop_url,
    year: null,
    overview: item.movie_title,
  };
}

export function ProfilePageContent() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listsLoading, setListsLoading] = useState(true);
  const [movieLists, setMovieLists] = useState({ watchlist: [], favorite: [] });
  const [listsError, setListsError] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Check authentication and fetch user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          setLoading(false);
          router.push("/sign-in?error=missing_supabase_env");
          return;
        }
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push("/sign-in");
          return;
        }

        setUser(session.user);
        setDisplayName(session.user.user_metadata?.full_name || "");
        setLoading(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        router.push("/sign-in");
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!user) {
      setMovieLists({ watchlist: [], favorite: [] });
      setListsError("");
      setListsLoading(false);
      return;
    }

    let isMounted = true;

    const loadMovieLists = async () => {
      setListsLoading(true);
      setListsError("");

      try {
        const { data, error } = await fetchUserMovieLists(user.id);

        if (!isMounted) return;

        if (error) {
          setListsError("Tabel movie_lists belum siap atau gagal dimuat.");
          setMovieLists({ watchlist: [], favorite: [] });
        } else {
          const groupedLists = (data || []).reduce(
            (accumulator, item) => {
              const normalizedItem = normalizeListItem(item);
              if (item.list_type === "favorite") {
                accumulator.favorite.push(normalizedItem);
              } else {
                accumulator.watchlist.push(normalizedItem);
              }
              return accumulator;
            },
            { watchlist: [], favorite: [] }
          );

          setMovieLists(groupedLists);
        }
      } catch (error) {
        if (!isMounted) return;
        setListsError(error.message || "Gagal memuat daftar user.");
        setMovieLists({ watchlist: [], favorite: [] });
      } finally {
        if (isMounted) {
          setListsLoading(false);
        }
      }
    };

    loadMovieLists();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      setMessage({ type: "error", text: "Name cannot be empty" });
      return;
    }

    setUpdateLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setMessage({ type: "error", text: "Auth service is unavailable. Please try again later." });
        return;
      }
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName.trim() },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Profile updated successfully" });
        setEditingName(false);
        // Update local state
        setUser((prev) => ({
          ...prev,
          user_metadata: { ...prev.user_metadata, full_name: displayName.trim() },
        }));
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        router.push("/sign-in");
        return;
      }
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] pt-24">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-[#e50914] mx-auto"></div>
            <p className="text-zinc-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const totalSavedTitles = movieLists.watchlist.length + movieLists.favorite.length;

  return (
    <div className="min-h-screen bg-[#111111] pb-16 pt-24">
      {/* Header Background */}
      <div className="absolute inset-x-0 top-0 h-64 bg-linear-to-b from-[#e50914]/20 to-transparent"></div>

      <div className="page-container relative z-10">
        {/* Back Button */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        {/* Page Title */}
        <h1 className="mb-12 text-5xl font-bold text-white">My Profile</h1>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-green-900/30 text-green-400 border border-green-700/50"
                : "bg-red-900/30 text-red-400 border border-red-700/50"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar - User Avatar */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-zinc-700 bg-linear-to-br from-zinc-800 to-zinc-900 p-6">
              {/* Avatar */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-[#e50914] to-red-900">
                  <span className="text-4xl font-bold text-white">{initials || "U"}</span>
                </div>
              </div>

              {/* User Email */}
              <div className="rounded-lg bg-zinc-900/50 p-4 text-center">
                <p className="text-xs uppercase tracking-widest text-zinc-500">Email Address</p>
                <p className="mt-1 truncate text-sm font-semibold text-white">{user.email}</p>
              </div>

              {/* Account Status */}
              <div className="mt-4 rounded-lg border border-green-700/50 bg-green-900/20 p-3 text-center">
                <p className="text-xs text-green-400">✓ Account Active</p>
              </div>

              {/* Member Since */}
              <div className="mt-4 rounded-lg bg-zinc-900/50 p-3 text-center text-xs text-zinc-400">
                <p>Member since</p>
                <p className="mt-1 font-semibold text-zinc-200">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="rounded-xl border border-zinc-700 bg-linear-to-br from-zinc-800 to-zinc-900 p-6">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded bg-[#e50914]">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </span>
                Account Information
              </h2>

              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-300">Email Address</label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="flex-1 rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm text-zinc-300"
                    />
                    <span className="text-xs text-zinc-500">Verified</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">Contact support to change email address</p>
                </div>

                {/* Full Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-zinc-300">Full Name</label>
                  <div className="mt-2 flex gap-3">
                    {editingName ? (
                      <>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Enter your full name"
                          className="flex-1 rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#e50914] focus:outline-none"
                        />
                        <button
                          onClick={handleUpdateProfile}
                          disabled={updateLoading}
                          className="rounded-lg bg-[#e50914] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#f6121d] disabled:opacity-50"
                        >
                          {updateLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingName(false);
                            setDisplayName(user.user_metadata?.full_name || "");
                          }}
                          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={displayName || "Not set"}
                          disabled
                          className="flex-1 rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm text-zinc-300"
                        />
                        <button
                          onClick={() => setEditingName(true)}
                          className="rounded-lg border border-[#e50914] px-4 py-2 text-sm font-semibold text-[#e50914] transition hover:bg-[#e50914]/10"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Library */}
            <div className="overflow-hidden rounded-xl border border-zinc-700 bg-[#0f0f0f] shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
              <div className="border-b border-zinc-800 bg-linear-to-r from-[#151515] via-[#121212] to-[#0f0f0f] px-6 py-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#e50914]">
                      My Library
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                      Saved titles
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                      A Netflix-style shelf for everything you’ve saved to watch later or marked as a favorite.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-black/40 px-3 py-1.5 text-xs text-zinc-300">
                    <span className="h-2 w-2 rounded-full bg-[#e50914]" />
                    {totalSavedTitles} saved title{totalSavedTitles === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              <div className="space-y-8 px-6 py-6">
                {listsLoading ? (
                  <div className="space-y-6">
                    <div className="h-28 animate-pulse rounded-lg bg-zinc-900" />
                    <div className="h-28 animate-pulse rounded-lg bg-zinc-900" />
                  </div>
                ) : movieLists.watchlist.length === 0 && movieLists.favorite.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-zinc-700 bg-black/20 p-8 text-center">
                    <p className="text-lg font-semibold text-white">Your shelves are empty</p>
                    <p className="mt-2 text-sm text-zinc-400">
                      Open a movie or series detail page and save it to Watchlist or Favourite to see it here.
                    </p>
                    {listsError ? <p className="mt-3 text-xs text-zinc-500">{listsError}</p> : null}
                  </div>
                ) : (
                  LIST_SECTIONS.map((section) => {
                    const items = movieLists[section.key] || [];

                    if (items.length === 0) {
                      return (
                        <section key={section.key} className="space-y-4 opacity-70">
                          <div className="flex items-end justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className={`h-3 w-3 rounded-full bg-linear-to-r ${section.accent}`} />
                                <h3 className="text-xl font-bold text-white">{section.title}</h3>
                              </div>
                              <p className="mt-1 text-sm text-zinc-400">{section.subtitle}</p>
                            </div>
                          </div>
                          <div className="rounded-lg border border-dashed border-zinc-700 bg-black/20 p-6 text-sm text-zinc-500">
                            No titles saved yet.
                          </div>
                        </section>
                      );
                    }

                    return (
                      <section key={section.key} className="space-y-4">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                              <div className="flex items-center gap-3">
                                <span className={`h-3 w-3 rounded-full bg-linear-to-r ${section.accent}`} />
                              <h3 className="text-xl font-bold text-white">{section.title}</h3>
                            </div>
                            <p className="mt-1 text-sm text-zinc-400">{section.subtitle}</p>
                          </div>
                          <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                            {items.length} item{items.length === 1 ? "" : "s"}
                          </span>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-2">
                          {items.map((item) => (
                            <div key={`${section.key}-${item.id}`} className="shrink-0">
                              <PosterCard item={item} />
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })
                )}
              </div>
            </div>

            {/* Preferences */}
            <div className="rounded-xl border border-zinc-700 bg-linear-to-br from-zinc-800 to-zinc-900 p-6">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded bg-[#e50914]">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                </span>
                Preferences
              </h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 rounded-lg border border-zinc-700 p-4 cursor-pointer hover:bg-zinc-800/50 transition">
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#e50914]" />
                  <div>
                    <p className="font-semibold text-white">Email Notifications</p>
                    <p className="text-xs text-zinc-400">Receive updates about new releases and recommendations</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-zinc-700 p-4 cursor-pointer hover:bg-zinc-800/50 transition">
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#e50914]" />
                  <div>
                    <p className="font-semibold text-white">Marketing Emails</p>
                    <p className="text-xs text-zinc-400">Get special offers and promotions</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-zinc-700 p-4 cursor-pointer hover:bg-zinc-800/50 transition">
                  <input type="checkbox" className="h-4 w-4 accent-[#e50914]" />
                  <div>
                    <p className="font-semibold text-white">Data Sharing</p>
                    <p className="text-xs text-zinc-400">Allow us to improve recommendations</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-xl border border-red-700/50 bg-linear-to-br from-red-900/20 to-red-800/10 p-6">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-red-400">
                <span className="flex h-8 w-8 items-center justify-center rounded bg-red-600">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                Danger Zone
              </h2>

              <button
                onClick={handleSignOut}
                className="w-full rounded-lg border border-red-600 bg-red-900/20 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-900/40 hover:text-red-300"
              >
                Sign Out
              </button>

              <p className="mt-3 text-xs text-zinc-500">You will be logged out from this device. You can sign in again anytime.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
