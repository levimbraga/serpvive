"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import posthog from "posthog-js";

const COUNTRIES = [
  { value: "", label: "Select country (optional)" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "BR", label: "Brazil" },
  { value: "CA", label: "Canada" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IN", label: "India" },
  { value: "AU", label: "Australia" },
  { value: "OTHER", label: "Other" },
];

// Simple timezone → country mapping for auto-detection
const TZ_COUNTRY_MAP: Record<string, string> = {
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US",
  "America/Los_Angeles": "US", "America/Phoenix": "US",
  "Europe/London": "UK",
  "America/Sao_Paulo": "BR", "America/Fortaleza": "BR",
  "America/Toronto": "CA", "America/Vancouver": "CA",
  "Europe/Berlin": "DE",
  "Europe/Paris": "FR",
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU",
};

export default function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  // Auto-detect country from timezone
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const detected = TZ_COUNTRY_MAP[tz];
      if (detected) setCountry(detected);
    } catch {
      // ignore
    }
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
        data: {
          full_name: fullName.trim(),
          country: country || null,
        },
      },
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    // Detect duplicate email
    if (data.user) {
      const hasNoIdentities = data.user.identities?.length === 0;
      const createdAt = new Date(data.user.created_at).getTime();
      const isOldUser = Date.now() - createdAt > 5000;
      if (hasNoIdentities || isOldUser) {
        setError("An account with this email already exists. Please sign in instead.");
        setLoading(false);
        return;
      }
    }

    // After signup, update profile with full_name and country
    if (data.user) {
      await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          ...(country ? { country } : {}),
        })
        .eq("id", data.user.id);
    }

    if (data.user) {
      posthog.identify(data.user.id, { email, name: fullName.trim(), ...(country ? { country } : {}) });
      posthog.capture("user_signed_up", { method: "email", country: country || null });
    }

    if (!data.session) {
      setLoading(false);
      setSuccess(true);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogle() {
    posthog.capture("user_signed_up", { method: "google" });
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
        <p className="text-[#94A3B8] text-base mt-3">Create your account</p>
      </div>

      <div className="bg-[#0F1219] border border-[#1E293B] rounded-2xl p-8">
        {success ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-[#22C55E] text-lg font-semibold mb-2">Check your email!</p>
            <p className="text-[#94A3B8] text-[15px] leading-relaxed">
              We sent a confirmation link to<br />
              <span className="text-white font-medium">{email}</span>
            </p>
            <p className="text-[#64748B] text-sm mt-4">Click the link to activate your account and get started.</p>
          </div>
        ) : (<>
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

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-[#94A3B8] mb-2">Full name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-[#07090F] border border-[#1E293B] text-white text-[15px] placeholder:text-[#475569] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors"
              placeholder="John Doe"
            />
          </div>
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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full h-12 px-4 rounded-xl bg-[#07090F] border border-[#1E293B] text-white text-[15px] placeholder:text-[#475569] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-[#94A3B8] mb-2">Country</label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[#07090F] border border-[#1E293B] text-white text-[15px] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors cursor-pointer"
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value} className="bg-[#07090F]">{c.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-[#EF4444]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#3B82F6] text-white text-[15px] font-semibold hover:bg-[#2563EB] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating account...
              </>
            ) : "Create account"}
          </button>
        </form>
        </>)}
      </div>

      <p className="text-center text-[15px] text-[#64748B] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#3B82F6] hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
