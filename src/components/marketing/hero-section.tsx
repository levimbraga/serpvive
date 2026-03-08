"use client";

import { ArrowRight, Shield, Clock, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useWaitlist } from "@/hooks/use-waitlist";

const MOCK_PAGES = [
  { url: "/best-crm-software-2024", status: "critical" as const, decay: -47, clicks: "167" },
  { url: "/remote-work-tools-guide", status: "critical" as const, decay: -32, clicks: "284" },
  { url: "/email-marketing-tips", status: "warning" as const, decay: -18, clicks: "512" },
  { url: "/saas-pricing-strategies", status: "healthy" as const, decay: -3, clicks: "891" },
];

const STATUS_STYLES = {
  critical: { dot: "bg-[#DC2626]", badge: "bg-[#DC2626]/10 text-[#DC2626]" },
  warning: { dot: "bg-[#D97706]", badge: "bg-[#D97706]/10 text-[#D97706]" },
  healthy: { dot: "bg-[#16A34A]", badge: "bg-[#16A34A]/10 text-[#16A34A]" },
};

function HealthScoreRing() {
  const score = 72;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="130" height="130" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#1E293B" strokeWidth="7" />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#D97706"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="animate-[ring-fill_1.2s_cubic-bezier(0.34,1.56,0.64,1)_0.5s_forwards]"
          style={{ strokeDashoffset: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[28px] font-extrabold text-white">{score}</span>
        <span className="text-[9px] font-semibold tracking-[0.15em] text-[#64748B]">/ 100</span>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative">
      {/* Outer glow */}
      <div className="absolute -inset-8 rounded-3xl bg-[#0D9488]/[0.04] blur-[60px]" />
      <div className="absolute -inset-4 rounded-3xl bg-[#7C3AED]/[0.02] blur-[40px]" />

      {/* Mockup: bg #111827, border 1px #1E293B, border-radius 16px, shadow 0 25px 80px rgba(0,0,0,0.6) */}
      <div className="relative overflow-hidden rounded-[16px] border border-[#1E293B] bg-[#111827] shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
        {/* Browser dots */}
        <div className="flex items-center gap-1.5 border-b border-[#1E293B]/80 px-4 py-3">
          <div className="h-[7px] w-[7px] rounded-full bg-[#3B3B3B]" />
          <div className="h-[7px] w-[7px] rounded-full bg-[#3B3B3B]" />
          <div className="h-[7px] w-[7px] rounded-full bg-[#3B3B3B]" />
          <div className="ml-4 flex-1 rounded bg-[#1E293B]/60 px-3 py-1">
            <span className="font-mono text-[10px] text-[#475569]">serpvive.com/dashboard</span>
          </div>
        </div>

        {/* Content — padding 24px */}
        <div className="p-[24px]">
          {/* Health Score row */}
          <div className="mb-5 flex items-center gap-5">
            <HealthScoreRing />
            <div>
              <p className="text-[10px] font-semibold tracking-[0.15em] text-[#475569]">
                HEALTH SCORE
              </p>
              <p className="mt-1.5 text-[13px] text-[#94A3B8]">
                <span className="font-mono font-semibold text-[#D97706]">-5</span> from last week
              </p>
              <div className="mt-2.5 flex gap-2">
                <span className="rounded-md bg-[#16A34A]/10 px-2 py-[3px] text-[10px] font-bold text-[#16A34A]">
                  12 Healthy
                </span>
                <span className="rounded-md bg-[#DC2626]/10 px-2 py-[3px] text-[10px] font-bold text-[#DC2626]">
                  4 Critical
                </span>
              </div>
            </div>
          </div>

          {/* Pages list */}
          <div className="space-y-[6px]">
            {MOCK_PAGES.map((page) => {
              const style = STATUS_STYLES[page.status];
              return (
                <div
                  key={page.url}
                  className="flex items-center justify-between rounded-lg border border-[#1E293B]/60 bg-[#0D1117] px-3 py-2"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`h-[6px] w-[6px] shrink-0 rounded-full ${style.dot}`} />
                    <span className="truncate font-mono text-[11px] text-[#CBD5E1]">
                      {page.url}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="hidden font-mono text-[10px] text-[#475569] sm:block">
                      {page.clicks}
                    </span>
                    <span
                      className={`rounded-md px-1.5 py-[2px] font-mono text-[10px] font-bold ${style.badge}`}
                    >
                      {page.decay}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const [email, setEmail] = useState("");
  const waitlist = useWaitlist();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email) waitlist.submit(email, "hero");
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0A0E1A]">
      {/* Noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Decorative arcs — Surfer-style, color #1a1f35 */}
      <svg
        className="pointer-events-none absolute right-[-200px] top-[-100px] h-[700px] w-[700px] opacity-[0.06]"
        viewBox="0 0 700 700"
        fill="none"
      >
        <circle cx="350" cy="350" r="300" stroke="#1a1f35" strokeWidth="1.5" />
        <circle cx="350" cy="350" r="200" stroke="#1a1f35" strokeWidth="1" />
        <circle cx="350" cy="350" r="100" stroke="#1a1f35" strokeWidth="0.5" />
      </svg>
      <svg
        className="pointer-events-none absolute bottom-[100px] left-[-150px] h-[500px] w-[500px] opacity-[0.05]"
        viewBox="0 0 500 500"
        fill="none"
      >
        <path d="M 250 50 A 200 200 0 0 1 450 250" stroke="#1a1f35" strokeWidth="1.5" />
        <path d="M 250 100 A 150 150 0 0 1 400 250" stroke="#1a1f35" strokeWidth="1" />
      </svg>

      {/* Teal ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-[10%] h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#0D9488]/[0.03] blur-[150px]" />
      {/* Purple secondary glow */}
      <div className="pointer-events-none absolute right-[10%] top-[20%] h-[300px] w-[400px] rounded-full bg-[#7C3AED]/[0.02] blur-[120px]" />

      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center gap-16 px-6 pb-24 pt-[140px] lg:flex-row lg:items-center lg:gap-12 lg:pt-[160px]">
        {/* Left — Copy */}
        <div className="flex-1 text-center lg:text-left">
          {/* AI tag — bg rgba(124,58,237,0.1), border rgba(124,58,237,0.3), color #A78BFA, padding 6px 16px, radius 20px, 13px */}
          <div
            className="mb-8 inline-flex items-center gap-2 rounded-[20px] border px-[16px] py-[6px] opacity-0 animate-[fadeUp_0.6s_ease_0.1s_forwards]"
            style={{
              background: "rgba(124, 58, 237, 0.1)",
              borderColor: "rgba(124, 58, 237, 0.3)",
            }}
          >
            <Sparkles size={13} strokeWidth={1.5} className="text-[#A78BFA]" />
            <span className="text-[13px] font-semibold tracking-wide text-[#A78BFA]">
              AI-Powered Content Decay Monitor
            </span>
          </div>

          {/* H1 — 72px desktop, 40px mobile, weight 800, letter-spacing -3px, line-height 1.05 */}
          <h1 className="opacity-0 animate-[fadeUp_0.6s_ease_0.2s_forwards]">
            <span className="block text-[40px] font-[800] leading-[1.05] tracking-[-3px] text-white lg:text-[72px]">
              Revive your
            </span>
            <span className="block text-[40px] font-[800] leading-[1.05] tracking-[-3px] text-[#0D9488] lg:text-[72px]">
              rankings.
            </span>
          </h1>

          {/* Subtitle — 18px, #94A3B8, NO bold */}
          <p className="mx-auto mt-6 max-w-[480px] text-[18px] leading-[1.7] text-[#94A3B8] opacity-0 animate-[fadeUp_0.6s_ease_0.35s_forwards] lg:mx-0">
            Your content is dying. We detect it, explain WHY with AI, and tell you exactly WHAT to do.
          </p>

          {/* Email + CTA */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-[480px] flex-col gap-3 opacity-0 animate-[fadeUp_0.6s_ease_0.5s_forwards] sm:flex-row lg:mx-0"
          >
            {/* Input — bg #111827, border #1E293B, h-52px, radius 8px, focus: border #0D9488 + shadow */}
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-[52px] flex-1 rounded-[8px] border border-[#1E293B] bg-[#111827] px-4 text-[14px] text-white placeholder:text-[#475569] transition-all focus:border-[#0D9488] focus:outline-none focus:shadow-[0_0_0_3px_rgba(13,148,136,0.15)]"
            />
            {/* Button — bg #0D9488, h-52px, px-32px, radius 8px, 16px weight 600 */}
            <button
              type="submit"
              disabled={waitlist.status === "loading"}
              className="group flex h-[52px] items-center justify-center gap-2 rounded-[8px] bg-[#0D9488] px-[32px] text-[16px] font-semibold text-white transition-all duration-200 hover:bg-[#0F766E] hover:shadow-[0_0_40px_rgba(13,148,136,0.25)] hover:-translate-y-[1px] disabled:opacity-50"
            >
              {waitlist.status === "loading" ? (
                "Joining..."
              ) : (
                <>
                  Join the Waitlist
                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </form>

          {waitlist.status === "success" && (
            <p className="mt-3 text-[14px] font-medium text-[#16A34A]">{waitlist.message}</p>
          )}
          {waitlist.status === "error" && (
            <p className="mt-3 text-[14px] font-medium text-[#DC2626]">{waitlist.message}</p>
          )}

          {/* Trust badges — 14px, #64748B text, #0D9488 icons */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 opacity-0 animate-[fadeUp_0.6s_ease_0.65s_forwards] lg:justify-start">
            {[
              { icon: Clock, text: "7-day free trial" },
              { icon: Shield, text: "Cancel anytime" },
              { icon: Sparkles, text: "First diagnosis free" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={14} strokeWidth={1.5} className="text-[#0D9488]" />
                <span className="text-[14px] text-[#64748B]">{text}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <p className="mt-6 text-[13px] text-[#475569] opacity-0 animate-[fadeUp_0.6s_ease_0.8s_forwards]">
            Trusted by <span className="font-semibold text-[#64748B]">200+</span> SEO professionals
            on the waitlist
          </p>
        </div>

        {/* Right — Dashboard mockup (hidden on mobile) */}
        <div className="hidden w-full max-w-[520px] flex-1 opacity-0 animate-[fadeUp_0.8s_ease_0.4s_forwards] lg:block">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
