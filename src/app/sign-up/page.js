import { SignUpForm } from "@/features/auth/components/SignUpForm";

export const metadata = {
  title: "Sign Up",
  description: "Create your Flixaroo account and start streaming.",
  alternates: {
    canonical: "/sign-up",
  },
};

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111111] pt-24 text-zinc-100 sm:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(229,9,20,0.28),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.08),transparent_30%),linear-gradient(180deg,rgba(17,17,17,0.35)_0%,rgba(17,17,17,0.9)_72%,rgba(17,17,17,1)_100%)]" />

      <main className="relative z-10 page-container flex min-h-[calc(100vh-8rem)] items-center justify-center pb-14">
        <section className="w-full max-w-md rounded-sm border border-zinc-700/80 bg-black/70 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:p-8">
          <SignUpForm />
        </section>
      </main>
    </div>
  );
}
