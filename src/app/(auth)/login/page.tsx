"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import posthog from "posthog-js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      posthog.identify(data.user.id, { email });
      posthog.capture("user_logged_in", { method: "email" });
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogle() {
    posthog.capture("user_logged_in", { method: "google" });
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
  }

  return (
    <div className="w-full max-w-[480px]">
      <div className="text-center mb-10">
        <h1 className="text-[32px] font-extrabold tracking-tight text-white">
          Serp<span className="text-[#3B82F6]">Vive</span>
        </h1>
        <p className="text-[#94A3B8] text-base mt-3">Sign in to your account</p>
      </div>

      <div className="bg-[#0F1219] border border-[#1E293B] rounded-2xl p-8">
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-[#1E293B] bg-[#0F1219] text-white text-[15px] font-medium hover:bg-[#1E293B] transition-colors"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#1E293B]" />
          <span className="text-sm text-[#64748B]">or</span>
          <div className="flex-1 h-px bg-[#1E293B]" />
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#94A3B8] mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-[#07090F] border border-[#1E293B] text-white text-[15px] placeholder:text-[#475569] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#94A3B8] mb-2">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-4 pr-12 rounded-xl bg-[#07090F] border border-[#1E293B] text-white text-[15px] placeholder:text-[#475569] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors"
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition-colors"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-[#EF4444]">{error}</p>
          )}

          <div className="flex items-center justify-between">
            <Link href="/forgot-password" className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#3B82F6] text-white text-[15px] font-semibold hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>

      <p className="text-center text-[15px] text-[#64748B] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#3B82F6] hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
