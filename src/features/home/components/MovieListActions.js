"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchMovieListState, toggleMovieListItem } from "@/lib/supabase/movieLists";

const LIST_TYPES = {
  watchlist: {
    label: "Watchlist",
    activeLabel: "Saved to Watchlist",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75h10.5a1.5 1.5 0 011.5 1.5v15l-6.75-3.75L5.25 20.25v-15a1.5 1.5 0 011.5-1.5z" />
      </svg>
    ),
  },
  favorite: {
    label: "Favourite",
    activeLabel: "Added to Favourites",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.53L12 21.35z" />
      </svg>
    ),
  },
};

export function MovieListActions({ content }) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(supabase));
  const [selectedLists, setSelectedLists] = useState(new Set());
  const [pendingListType, setPendingListType] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      const sessionUser = data?.session?.user ?? null;
      setUser(sessionUser);
      setLoading(false);

      if (sessionUser) {
        const { data: listData, error } = await fetchMovieListState(content.id, sessionUser.id);

        if (!isMounted) return;

        if (error && error.code !== "42P01") {
          setMessage("Gagal memuat status simpan.");
        }

        setSelectedLists(new Set((listData || []).map((item) => item.list_type)));
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      if (!sessionUser) {
        setSelectedLists(new Set());
        setMessage("");
        return;
      }

      fetchMovieListState(content.id, sessionUser.id).then(({ data: listData, error }) => {
        if (!isMounted) return;
        if (error && error.code !== "42P01") {
          setMessage("Gagal memuat status simpan.");
        }
        setSelectedLists(new Set((listData || []).map((item) => item.list_type)));
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [content.id, supabase]);

  const handleToggle = async (listType) => {
    if (!supabase) {
      setMessage("Supabase belum dikonfigurasi.");
      return;
    }

    if (!user) {
      router.push("/sign-in");
      return;
    }

    setPendingListType(listType);
    setMessage("");

    const result = await toggleMovieListItem(content, listType, user);

    if (result?.tableMissing) {
      setMessage("Tabel movie_lists belum dibuat di Supabase.");
      setPendingListType("");
      return;
    }

    if (result?.error) {
      setMessage(result.error.message || "Gagal menyimpan pilihan.");
      setPendingListType("");
      return;
    }

    setSelectedLists((prev) => {
      const next = new Set(prev);
      if (result.isActive) {
        next.add(listType);
      } else {
        next.delete(listType);
      }
      return next;
    });
    setPendingListType("");
  };

  if (loading) {
    return (
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="h-11 w-36 animate-pulse rounded bg-zinc-800" />
        <div className="h-11 w-36 animate-pulse rounded bg-zinc-800" />
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap gap-3">
        {Object.entries(LIST_TYPES).map(([listType, config]) => {
          const isActive = selectedLists.has(listType);
          const isPending = pendingListType === listType;

          return (
            <button
              key={listType}
              type="button"
              onClick={() => handleToggle(listType)}
              disabled={Boolean(pendingListType)}
              className={`flex items-center gap-2 rounded px-6 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isActive
                  ? "bg-[#e50914] text-white hover:bg-[#f6121d]"
                  : "bg-zinc-700 text-white hover:bg-zinc-600"
              }`}
            >
              {isPending ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" className="opacity-20" stroke="currentColor" strokeWidth="4" />
                  <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              ) : (
                config.icon
              )}
              {isActive ? config.activeLabel : config.label}
            </button>
          );
        })}
      </div>

      {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
    </div>
  );
}