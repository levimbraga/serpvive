"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = getSupabaseBrowser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    setSent(true);
  }

  return (
    <div className="w-full max-w-[480px]">
      <div className="text-center mb-10">
        <Link href="/" className="inline-block text-[32px] font-extrabold tracking-tight text-white no-underline hover:opacity-90 transition-opacity">
          Serp<span className="text-[#3B82F6]">Vive</span>
        </Link>
        <p className="text-[#94A3B8] text-base mt-3">Reset your password</p>
      </div>

      <div className="bg-[#0F1219] border border-[#1E293B] rounded-2xl p-8">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-[#3B82F6]/10 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <p className="text-white text-lg font-semibold mb-2">Check your email</p>
            <p className="text-[#94A3B8] text-[15px] leading-relaxed">
              We sent a password reset link to<br />
              <span className="text-white font-medium">{email}</span>
            </p>
            <p className="text-[#64748B] text-sm mt-4">
              Click the link in the email to set a new password.
            </p>
          </div>
        ) : (
          <>
            <p className="text-[#94A3B8] text-sm mb-6">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    Sending...
                  </>
                ) : "Send reset link"}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="text-center text-[15px] text-[#64748B] mt-6">
        <Link href="/login" className="text-[#3B82F6] hover:underline inline-flex items-center gap-1">
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to login
        </Link>
      </p>
    </div>
  );
}
