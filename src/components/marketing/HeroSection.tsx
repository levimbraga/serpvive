"use client";

import posthog from "posthog-js";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-12 pt-[140px] sm:pt-[160px] pb-16 text-center overflow-hidden">
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(59,130,246,0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
        }}
      />

      {/* Decorative arcs */}
      <div className="absolute top-[-350px] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full border border-[#1E293B]/40 pointer-events-none" />
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border border-[#1E293B]/30 pointer-events-none" />
      <div className="absolute top-[50px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full border border-[#1E293B]/20 pointer-events-none" />
      <div className="absolute top-[200px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full border border-[rgba(59,130,246,0.08)] pointer-events-none" />

      {/* Radial glow */}
      <div
        className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[1000px] h-[800px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 60%)" }}
      />
      <div
        className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 60%)" }}
      />

      {/* Headline */}
      <h1
        className="relative font-extrabold leading-[1.05] mb-8 animate-[fadeInUp_0.6s_ease_0.1s_both]"
        style={{ fontSize: "clamp(3.5rem, 7vw, 6.875rem)", letterSpacing: "-0.05em", maxWidth: "min(900px, 90vw)" }}
      >
        Your blog is losing traffic{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)" }}
        >
          right now.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="relative leading-[1.7] text-[#94A3B8] mx-auto mb-11 animate-[fadeInUp_0.6s_ease_0.2s_both]" style={{ fontSize: "clamp(1.125rem, 1.8vw, 1.5rem)", maxWidth: "min(600px, 60vw)" }}>
        SerpVive finds the dying posts, explains why, and tells you exactly what to fix.
      </p>

      {/* CTAs */}
      <div className="relative flex flex-col items-center gap-4 animate-[fadeInUp_0.6s_ease_0.3s_both]">
        <a
          href="/signup"
          onClick={() => posthog.capture("cta_clicked", { location: "hero", type: "primary" })}
          className="inline-flex items-center gap-2.5 rounded-xl bg-[#3B82F6] text-white font-bold no-underline transition-all duration-200 hover:bg-[#2563EB] hover:shadow-[0_8px_50px_rgba(59,130,246,0.2)] hover:-translate-y-0.5"
          style={{ fontSize: "clamp(1.05rem, 1.3vw, 1.25rem)", padding: "clamp(16px, 1.5vw, 22px) clamp(32px, 3.5vw, 56px)" }}
        >
          Get started free
          <span style={{ fontSize: "clamp(18px, 1.4vw, 24px)" }}>&rarr;</span>
        </a>
        <a
          href="#features"
          onClick={() => posthog.capture("cta_clicked", { location: "hero", type: "secondary" })}
          className="text-[#64748B] font-medium no-underline transition-colors duration-200 hover:text-[#94A3B8]"
          style={{ fontSize: "clamp(0.9rem, 1.1vw, 1.05rem)" }}
        >
          See how it works &darr;
        </a>
      </div>

      {/* Trust badge */}
      <p className="relative text-[#475569] mt-6 animate-[fadeInUp_0.6s_ease_0.4s_both]" style={{ fontSize: "clamp(12px, 1vw, 14px)" }}>
        Powered by Claude Opus 4.6 &middot; Read-only access &middot; No credit card required
      </p>

      {/* Product screenshot */}
      <div className="relative mt-16 mx-auto animate-[fadeInUp_0.8s_ease_0.5s_both]" style={{ width: "clamp(700px, 75vw, 1400px)", maxWidth: "95vw" }}>
        {/* Blue glow */}
        <div
          className="absolute -inset-6 rounded-3xl pointer-events-none"
          style={{
            boxShadow: "0 0 80px rgba(59,130,246,0.2), 0 0 160px rgba(59,130,246,0.08)",
          }}
        />

        {/* Browser mockup */}
        <div
          className="relative rounded-2xl overflow-hidden border border-[rgba(59,130,246,0.15)]"
          style={{
            background: "#0F1219",
            boxShadow: "0 0 60px rgba(59,130,246,0.12), 0 40px 120px rgba(0,0,0,0.5)",
          }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#1E293B]" style={{ background: "rgba(7,9,15,0.5)" }}>
            <div className="w-[9px] h-[9px] rounded-full bg-[#EF4444] opacity-50" />
            <div className="w-[9px] h-[9px] rounded-full bg-[#F59E0B] opacity-50" />
            <div className="w-[9px] h-[9px] rounded-full bg-[#22C55E] opacity-50" />
            <span className="flex-1 text-center text-[12px] text-[#475569]" style={{ fontFamily: "var(--font-mono, monospace)" }}>
              serpvive.com/dashboard
            </span>
          </div>

          {/* Dashboard content */}
          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-6">
            {/* Left: Health Score */}
            <div className="flex flex-col items-center p-6 rounded-xl" style={{ background: "rgba(7,9,15,0.4)", border: "1px solid rgba(30,41,59,0.4)" }}>
              <div className="relative w-[120px] h-[120px] mb-3">
                <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#1E293B" strokeWidth="6" />
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#D97706" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray="276" strokeDashoffset="77"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[36px] font-extrabold text-white leading-none">72</span>
                  <span className="text-[11px] text-[#64748B]">/ 100</span>
                </div>
              </div>
              <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">Health Score</p>
              <p className="text-[13px] text-[#94A3B8]"><span className="text-[#EF4444] font-semibold">-5</span> from last week</p>
              <div className="flex gap-1.5 mt-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>12 Healthy</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>6 Warning</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>4 Critical</span>
              </div>
            </div>

            {/* Right: Decaying pages list */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[14px] font-bold text-[#F1F5F9]">Decaying Pages</h3>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>4 need attention</span>
              </div>
              {[
                { url: "/best-crm-software-2024", clicks: "167", decay: "-47%", severity: "critical" },
                { url: "/remote-work-tools-guide", clicks: "284", decay: "-32%", severity: "critical" },
                { url: "/project-management-tips", clicks: "198", decay: "-28%", severity: "critical" },
                { url: "/email-marketing-tips", clicks: "512", decay: "-18%", severity: "warning" },
                { url: "/content-strategy-2025", clicks: "345", decay: "-12%", severity: "warning" },
                { url: "/saas-pricing-strategies", clicks: "891", decay: "-3%", severity: "healthy" },
              ].map((row) => (
                <div
                  key={row.url}
                  className="flex items-center px-3.5 py-3 rounded-lg transition-all"
                  style={{ background: "rgba(7,9,15,0.5)", border: "1px solid transparent" }}
                >
                  <div className={`w-[7px] h-[7px] rounded-full mr-3 flex-shrink-0 ${
                    row.severity === "critical" ? "bg-[#EF4444]" : row.severity === "warning" ? "bg-[#F59E0B]" : "bg-[#22C55E]"
                  }`} />
                  <span className="flex-1 text-[12px] text-[#94A3B8] truncate" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                    {row.url}
                  </span>
                  <span className="text-[12px] text-[#64748B] mr-3 tabular-nums" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                    {row.clicks}
                  </span>
                  <span className={`text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded ${
                    row.severity === "critical"
                      ? "text-[#EF4444] bg-[rgba(239,68,68,0.1)]"
                      : row.severity === "warning"
                      ? "text-[#F59E0B] bg-[rgba(245,158,11,0.1)]"
                      : "text-[#22C55E] bg-[rgba(34,197,94,0.06)]"
                  }`} style={{ fontFamily: "var(--font-mono, monospace)" }}>
                    {row.decay}
                  </span>
                  {row.severity === "critical" && (
                    <span className="ml-2.5 text-[10px] font-semibold text-white bg-[#F97316] px-3 py-1 rounded cursor-pointer hover:bg-[#EA580C] transition-colors whitespace-nowrap">
                      Diagnose
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Social proof mini-bar */}
      <div className="relative flex flex-wrap justify-center gap-x-2 mt-12 animate-[fadeInUp_0.6s_ease_0.6s_both]">
        {["Built for SEO professionals", "Revive your rankings", "Free plan available"].map((text, i) => (
          <span key={text} className="flex items-center gap-2 text-[12px] text-[#475569] font-medium uppercase tracking-wider">
            {text}
            {i < 2 && <span className="text-[#1E293B]">&#x2022;</span>}
          </span>
        ))}
      </div>
    </section>
  );
}
