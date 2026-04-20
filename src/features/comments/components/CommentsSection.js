"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function CommentsSection({ movieId, movieTitle }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [error, setError] = useState("");

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          setUser(null);
          setLoading(false);
          return;
        }
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (err) {
        console.error("Error checking auth:", err);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          setComments([]);
          return;
        }
        
        // For now, we'll use a simple approach - fetch from a comments table if it exists
        // If not, we can store in localStorage or just show a message
        const { data, error } = await supabase
          .from("movie_comments")
          .select("id, user_id, user_email, user_name, text, rating, created_at")
          .eq("movie_id", movieId)
          .order("created_at", { ascending: false });

        const hasMeaningfulError = Boolean(error) && Object.keys(error).length > 0 && error.code !== "PGRST116";

        if (hasMeaningfulError) {
          console.error("Error fetching comments:", error);
          setComments([]);
        } else {
          setComments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchComments();
  }, [movieId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      setError("Please enter a comment");
      return;
    }

    if (commentText.length > 500) {
      setError("Comment must be less than 500 characters");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Auth service is unavailable. Please check deployment environment variables.");
        return;
      }

      const { error: insertError } = await supabase.from("movie_comments").insert([
        {
          movie_id: movieId,
          movie_title: movieTitle,
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.full_name || user.email.split("@")[0],
          text: commentText.trim(),
          rating: rating,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        // If table doesn't exist, add to local state only
        if (insertError.code === "PGRST116") {
          const newComment = {
            id: Math.random().toString(36),
            user_id: user.id,
            user_email: user.email,
            user_name: user.user_metadata?.full_name || user.email.split("@")[0],
            text: commentText.trim(),
            rating: rating,
            created_at: new Date().toISOString(),
            local: true,
          };
          setComments((prev) => [newComment, ...prev]);
          setCommentText("");
          setRating(5);
          setError("");
        } else {
          setError("Failed to submit comment. Please try again.");
        }
      } else {
        // Successfully inserted, refresh comments
        const { data } = await supabase
          .from("movie_comments")
          .select("id, user_id, user_email, user_name, text, rating, created_at")
          .eq("movie_id", movieId)
          .order("created_at", { ascending: false });

        if (data) {
          setComments(data);
        }
        setCommentText("");
        setRating(5);
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="animate-pulse text-zinc-400">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 border-t border-zinc-800 py-12">
      {/* Section Title */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Reviews & Comments</h2>
        <p className="text-zinc-400">Share your thoughts about this content</p>
      </div>

      {/* Comment Form */}
      {!user ? (
        <div className="rounded-lg border border-zinc-700 bg-linear-to-br from-zinc-800 to-zinc-900 p-8 text-center">
          <svg className="h-16 w-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2l-4 4z" />
          </svg>
          <p className="text-zinc-300 mb-4 text-lg">Sign in to leave a comment</p>
          <button
            onClick={() => router.push("/sign-in")}
            className="inline-block rounded bg-[#e50914] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#f6121d] uppercase tracking-wider"
          >
            Sign In Now
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmitComment} className="rounded-lg border border-zinc-700 bg-linear-to-br from-zinc-800 to-zinc-900 p-6 space-y-5">
          {/* User Info */}
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-[#e50914] to-red-900">
              <span className="text-xs font-bold text-white">
                {user.user_metadata?.full_name
                  ? user.user_metadata.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : user.email[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-white">{user.user_metadata?.full_name || user.email}</p>
              <p className="text-xs text-zinc-500">Verified User</p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-bold text-white mb-3 uppercase tracking-wider">Your Rating</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition transform hover:scale-110"
                >
                  <svg
                    className={`h-10 w-10 transition ${rating >= star ? "text-[#e50914]" : "text-zinc-700"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Comment Text */}
          <div>
            <label className="block text-sm font-bold text-white mb-3 uppercase tracking-wider">Your Comment</label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts... (max 500 characters)"
              maxLength={500}
              rows={5}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/20 resize-none transition"
            />
            <div className="mt-2 flex justify-between items-center">
              <div className="text-xs text-zinc-500">{commentText.length}/500 characters</div>
              {commentText.length >= 450 && (
                <span className="text-xs text-yellow-500">Getting close to limit</span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-400 bg-red-900/20 border border-red-700/50 rounded-lg px-4 py-3 flex items-start gap-2">
              <svg className="h-5 w-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="w-full rounded-lg bg-[#e50914] px-4 py-3 font-bold text-white transition hover:bg-[#f6121d] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {submitting ? "Submitting..." : "Post Comment"}
          </button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">{comments.length} Comments</h3>
          {comments.length > 0 && (
            <div className="text-sm text-zinc-400">Most Recent</div>
          )}
        </div>

        {comments.length === 0 ? (
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/30 p-8 text-center">
            <p className="text-zinc-400 text-lg">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {comments.map((comment, idx) => (
              <div key={comment.id} className="group rounded-lg border border-zinc-700 bg-linear-to-br from-zinc-900 to-zinc-900/50 p-6 hover:border-zinc-600 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-[#e50914] to-red-900 shrink-0">
                      <span className="text-xs font-bold text-white">
                        {comment.user_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{comment.user_name}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(comment.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-5 w-5 ${comment.rating >= star ? "text-[#e50914]" : "text-zinc-700"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-zinc-200 text-base leading-relaxed">{comment.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
