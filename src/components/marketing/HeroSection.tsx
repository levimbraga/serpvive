"use client";

import { useState, type FormEvent } from "react";
import { useWaitlist } from "@/hooks/use-waitlist";

const MOCK_PAGES = [
  { url: "/best-crm-software-2024", status: "c" as const, clicks: "167", decay: "-47%", diagnose: true },
  { url: "/remote-work-tools-guide", status: "c" as const, clicks: "284", decay: "-32%", diagnose: true },
  { url: "/email-marketing-tips", status: "w" as const, clicks: "512", decay: "-18%", diagnose: false },
  { url: "/saas-pricing-strategies", status: "h" as const, clicks: "891", decay: "-3%", diagnose: false },
];

const DOT_COLOR = { c: "bg-[#EF4444]", w: "bg-[#F59E0B]", h: "bg-[#22C55E]" };
const DECAY_STYLE = {
  c: "text-[#EF4444] bg-[rgba(239,68,68,0.1)]",
  w: "text-[#F59E0B] bg-[rgba(245,158,11,0.1)]",
  h: "text-[#22C55E] bg-[rgba(34,197,94,0.06)]",
};

function DashboardMockup() {
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (72 / 100) * circumference;

  return (
    <div
      className="overflow-hidden rounded-[16px] animate-[fadeInRight_0.8s_ease_0.3s_both]"
      style={{
        background: "#0F1219",
        border: "1px solid #1E293B",
        boxShadow: "0 30px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02) inset",
      }}
    >
      {/* Browser bar */}
      <div className="flex items-center gap-[8px] border-b border-[#1E293B] px-[16px] py-[12px]" style={{ background: "rgba(7,9,15,0.5)" }}>
        <div className="h-[8px] w-[8px] rounded-full bg-[#EF4444] opacity-60" />
        <div className="h-[8px] w-[8px] rounded-full bg-[#F59E0B] opacity-60" />
        <div className="h-[8px] w-[8px] rounded-full bg-[#22C55E] opacity-60" />
        <span className="flex-1 text-center font-mono text-[11px] text-[#475569]">serpvive.com/dashboard</span>
      </div>

      {/* Body — padding 24px */}
      <div className="p-[24px]">
        {/* Health Score row */}
        <div className="mb-[20px] flex items-center gap-[20px]">
          {/* Ring — 86x86 */}
          <div className="relative h-[86px] w-[86px]">
            <svg viewBox="0 0 80 80" className="-rotate-90" width="86" height="86">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#1E293B" strokeWidth="5" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="block text-[24px] font-[800] leading-none text-white">72</span>
              <span className="text-[9px] text-[#64748B]">/ 100</span>
            </div>
          </div>

          <div>
            <h3 className="mb-[3px] text-[10px] font-semibold uppercase tracking-[1.5px] text-[#64748B]">Health Score</h3>
            <div className="mb-[6px] text-[12px] text-[#94A3B8]">
              <span className="font-semibold text-[#EF4444]">-5</span> from last week
            </div>
            <div className="flex gap-[6px]">
              <span className="rounded-[5px] bg-[rgba(34,197,94,0.1)] px-[8px] py-[2px] text-[10px] font-semibold text-[#22C55E]">12 Healthy</span>
              <span className="rounded-[5px] bg-[rgba(239,68,68,0.1)] px-[8px] py-[2px] text-[10px] font-semibold text-[#EF4444]">4 Critical</span>
            </div>
          </div>
        </div>

        {/* Page rows */}
        <div className="space-y-[5px]">
          {MOCK_PAGES.map((page) => (
            <div
              key={page.url}
              className="flex items-center rounded-[7px] border border-transparent px-[12px] py-[10px] text-[12px] transition-[border-color] duration-150 hover:border-[#1E293B]"
              style={{ background: "rgba(7,9,15,0.5)" }}
            >
              <div className={`mr-[10px] h-[6px] w-[6px] shrink-0 rounded-full ${DOT_COLOR[page.status]}`} />
              <span className="flex-1 font-mono text-[11px] text-[#94A3B8]">{page.url}</span>
              <span className="mr-[10px] font-mono text-[11px] text-[#64748B]">{page.clicks}</span>
              <span className={`rounded-[3px] px-[6px] py-[2px] font-mono text-[11px] font-bold ${DECAY_STYLE[page.status]}`}>{page.decay}</span>
              {page.diagnose && (
                <span className="ml-[8px] cursor-pointer rounded-[4px] bg-[#F97316] px-[10px] py-[3px] text-[10px] font-semibold text-white">Diagnose</span>
              )}
            </div>
          ))}
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
    <section className="relative flex min-h-screen items-center overflow-hidden px-5 pb-[80px] pt-[130px] sm:px-[48px]" style={{ background: "#07090F" }}>
      {/* Decorative arcs */}
      <div className="pointer-events-none absolute -right-[250px] -top-[180px] h-[800px] w-[800px] rounded-full" style={{ border: "1px solid rgba(59,130,246,0.06)" }} />
      <div className="pointer-events-none absolute right-[-100px] top-[100px] h-[500px] w-[500px] rounded-full" style={{ border: "1px solid rgba(59,130,246,0.04)" }} />
      <div className="pointer-events-none absolute -left-[150px] -bottom-[300px] h-[600px] w-[600px] rounded-full" style={{ border: "1px solid rgba(59,130,246,0.03)" }} />

      {/* Glow spots */}
      <div className="pointer-events-none absolute right-[20%] top-[30%] h-[500px] w-[500px]" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute left-[10%] top-[60%] h-[300px] w-[300px]" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.03) 0%, transparent 70%)" }} />

      {/* Grid: 1.1fr 0.9fr, gap 64px */}
      <div className="relative z-[1] mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-[48px] lg:grid-cols-[1.1fr_0.9fr] lg:gap-[64px]">
        {/* Left — Copy */}
        <div>
          {/* Tag — orange glow, ✦ prefix */}
          <div
            className="mb-[28px] inline-flex w-fit items-center gap-[8px] rounded-full px-[16px] py-[7px] text-[13px] font-medium text-[#FB923C] animate-[fadeInUp_0.6s_ease_both]"
            style={{
              background: "rgba(249,115,22,0.12)",
              border: "1px solid rgba(249,115,22,0.25)",
            }}
          >
            <span className="text-[14px]">✦</span>
            AI-Powered Content Decay Monitor
          </div>

          {/* H1 — 68px desktop, 52px tablet, 40px mobile */}
          <h1 className="mb-[24px] text-[40px] font-[800] leading-[1.05] tracking-[-1.5px] text-[#F1F5F9] animate-[fadeInUp_0.6s_ease_0.1s_both] sm:text-[52px] sm:tracking-[-2px] lg:text-[68px] lg:tracking-[-3px]">
            Revive your
            <span className="block text-[#3B82F6]">rankings.</span>
          </h1>

          {/* Subtitle — strong tags for WHY/WHAT */}
          <p className="mb-[36px] max-w-[460px] text-[18px] leading-[1.7] text-[#94A3B8] animate-[fadeInUp_0.6s_ease_0.2s_both]">
            Your content is dying. We detect it, explain <strong className="font-semibold text-[#F1F5F9]">WHY</strong> with AI, and tell you exactly <strong className="font-semibold text-[#F1F5F9]">WHAT</strong> to do.
          </p>

          {/* Form — gap 12px */}
          <form
            onSubmit={handleSubmit}
            className="mb-[20px] flex flex-col gap-[12px] animate-[fadeInUp_0.6s_ease_0.3s_both] sm:flex-row"
          >
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-[52px] w-full max-w-full rounded-[8px] border border-[#1E293B] bg-[#0F1219] px-[20px] font-sans text-[15px] text-[#F1F5F9] outline-none transition-all duration-200 placeholder:text-[#475569] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] sm:max-w-[320px]"
            />
            <button
              type="submit"
              disabled={waitlist.status === "loading"}
              className="flex h-[52px] items-center justify-center gap-[8px] whitespace-nowrap rounded-[8px] bg-[#3B82F6] px-[28px] font-sans text-[15px] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#2563EB] hover:shadow-[0_8px_40px_rgba(59,130,246,0.15)] disabled:opacity-50 sm:justify-start"
            >
              {waitlist.status === "loading" ? "Joining..." : "Join the Waitlist →"}
            </button>
          </form>

          {waitlist.status === "success" && (
            <p className="mb-3 text-[14px] font-medium text-[#22C55E]">{waitlist.message}</p>
          )}
          {waitlist.status === "error" && (
            <p className="mb-3 text-[14px] font-medium text-[#EF4444]">{waitlist.message}</p>
          )}

          {/* Trust — ✓ prefix in blue */}
          <div className="flex flex-wrap gap-[20px] animate-[fadeInUp_0.6s_ease_0.4s_both]">
            {["7-day free trial", "Cancel anytime", "First diagnosis free"].map((text) => (
              <span key={text} className="flex items-center gap-[6px] text-[13px] text-[#64748B]">
                <span className="text-[12px] font-bold text-[#3B82F6]">✓</span>
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Right — Dashboard mockup (hidden on mobile) */}
        <div className="hidden sm:block">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
