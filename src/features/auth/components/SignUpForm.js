"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const missingConfig = !supabase;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!agree) {
      setErrorMessage("You must agree to Terms of Use and Privacy Notice.");
      return;
    }

    if (missingConfig) {
      setErrorMessage("Supabase env belum diset. Cek NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const emailRedirectTo = typeof window !== "undefined" ? `${window.location.origin}/sign-in` : undefined;

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Account created. Please check your email to confirm your account.");
    setFullName("");
    setEmail("");
    setPassword("");
    setAgree(false);
  };

  const handleGoogleSignUp = async () => {
    if (missingConfig) {
      setErrorMessage("Supabase env belum diset. Cek NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setIsGoogleLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsGoogleLoading(false);
      }
    } catch (error) {
      setErrorMessage("Failed to sign up with Google");
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-semibold text-white">Create Account</h1>
      <p className="mt-2 text-sm text-zinc-400">Join Flixaroo and unlock your personal streaming space.</p>

      {/* Google Sign Up Button */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading}
        className="mt-6 w-full flex items-center justify-center gap-2 rounded-sm border border-zinc-600 bg-zinc-900/50 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-900 hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {isGoogleLoading ? "Creating account..." : "Sign up with Google"}
      </button>

      {/* Divider */}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 border-t border-zinc-700"></div>
        <span className="text-xs text-zinc-500 uppercase tracking-widest">Or</span>
        <div className="flex-1 border-t border-zinc-700"></div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">Full Name</span>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            placeholder="Your full name"
            className="w-full rounded-sm border border-zinc-600 bg-zinc-900/90 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#e50914]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="you@example.com"
            className="w-full rounded-sm border border-zinc-600 bg-zinc-900/90 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#e50914]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
            placeholder="Create a secure password"
            className="w-full rounded-sm border border-zinc-600 bg-zinc-900/90 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#e50914]"
          />
        </label>

        <label className="inline-flex items-start gap-2 pt-1 text-xs leading-relaxed text-zinc-400">
          <input
            type="checkbox"
            checked={agree}
            onChange={(event) => setAgree(event.target.checked)}
            className="mt-0.5 rounded border-zinc-600 bg-zinc-800"
          />
          <span>I agree to receive updates and accept the Terms of Use and Privacy Notice.</span>
        </label>

        {errorMessage ? (
          <p className="rounded-sm border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">{errorMessage}</p>
        ) : null}
        {successMessage ? (
          <p className="rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">{successMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 inline-flex w-full items-center justify-center rounded-sm bg-[#e50914] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#f6121d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Creating account..." : "Sign Up with Email"}
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-white transition hover:text-zinc-200">
          Sign in
        </Link>
      </p>
    </>
  );
}
