"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";
import { Eye, EyeOff, Info } from "lucide-react";
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

  return (
    <div className="w-full max-w-[480px]">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-[32px] font-extrabold tracking-tight text-white no-underline hover:opacity-90 transition-opacity">
          Serp<span className="text-[#3B82F6]">Vive</span>
        </Link>
        <p className="text-[#94A3B8] text-base mt-3">Sign in to your account</p>
      </div>

      {/* Waitlist mode banner */}
      <div className="mb-6 rounded-xl border border-[#3B82F6]/30 bg-[#3B82F6]/5 p-4 flex items-start gap-3">
        <Info size={18} strokeWidth={1.5} className="text-[#3B82F6] mt-0.5 flex-shrink-0" />
        <div className="text-[13px] leading-relaxed text-[#94A3B8]">
          <p className="text-white font-medium mb-1">SerpVive hasn&apos;t publicly launched yet</p>
          <p>
            Public signups are closed. Launching in <span className="text-white font-medium">H2 2026</span>.
            If you&apos;re not an invited tester,{" "}
            <Link href="/" className="text-[#3B82F6] hover:underline font-medium">
              join the waitlist
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="bg-[#0F1219] border border-[#1E293B] rounded-2xl p-8">
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
        Not on the waitlist yet?{" "}
        <Link href="/" className="text-[#3B82F6] hover:underline">Join the waitlist</Link>
      </p>
    </div>
  );
}
