"use client";

import posthog from "posthog-js";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-12 pt-[140px] sm:pt-[160px] pb-16 text-center overflow-hidden">
      {/* ── 1. Background grid pattern ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Fade grid out at edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, #07090F 75%)",
        }}
      />

      {/* ── Decorative arcs (Surfer-style) ── */}
      <div className="absolute top-[-350px] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full border border-[rgba(59,130,246,0.06)] pointer-events-none" />
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border border-[rgba(59,130,246,0.05)] pointer-events-none" />
      <div className="absolute top-[50px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full border border-[rgba(59,130,246,0.04)] pointer-events-none" />

      {/* ── Radial glow behind headline ── */}
      <div
        className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 65%)" }}
      />
      <div
        className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.04) 0%, transparent 65%)" }}
      />

      {/* ── Tag pill ── */}
      <div
        className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium text-[#FB923C] mb-9 animate-[fadeInUp_0.6s_ease_both]"
        style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.2)" }}
      >
        <span className="text-[14px]">&#x2726;</span>
        AI Content Decay Monitor
      </div>

      {/* ── Headline with gradient text ── */}
      <h1
        className="relative text-[40px] sm:text-[64px] lg:text-[84px] font-extrabold leading-[1.05] max-w-[1000px] mb-8 animate-[fadeInUp_0.6s_ease_0.1s_both]"
        style={{ letterSpacing: "-0.05em" }}
      >
        Your posts are losing traffic.
        <br />
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)" }}
        >
          We tell you why — and how to fix them.
        </span>
      </h1>

      {/* ── Subtitle ── */}
      <p className="relative text-[16px] sm:text-[20px] leading-[1.7] text-[#94A3B8] max-w-[660px] mx-auto mb-11 animate-[fadeInUp_0.6s_ease_0.2s_both]">
        SerpVive monitors every page on your blog. When traffic drops, our AI reads your competitors, compares with your content, and delivers a{" "}
        <strong className="text-[#F1F5F9] font-semibold">specific action plan</strong> — not generic advice.
      </p>

      {/* ── 4. Dual CTAs (Supademo hierarchy) ── */}
      <div className="relative flex flex-col sm:flex-row items-center gap-4 animate-[fadeInUp_0.6s_ease_0.3s_both]">
        <a
          href="/signup"
          onClick={() => posthog.capture("cta_clicked", { location: "hero", type: "primary" })}
          className="inline-flex items-center gap-2.5 h-[60px] px-12 rounded-xl bg-[#3B82F6] text-white text-[18px] font-semibold no-underline transition-all duration-200 hover:bg-[#2563EB] hover:shadow-[0_8px_50px_rgba(59,130,246,0.2)] hover:-translate-y-0.5 w-full sm:w-auto justify-center"
        >
          Get Started Free
          <span className="text-[20px]">&rarr;</span>
        </a>
        <a
          href="#features"
          onClick={() => posthog.capture("cta_clicked", { location: "hero", type: "secondary" })}
          className="inline-flex items-center gap-2 h-[60px] px-12 rounded-xl text-[#94A3B8] text-[18px] font-medium no-underline transition-all duration-200 hover:text-white hover:border-[rgba(59,130,246,0.4)] hover:bg-[rgba(59,130,246,0.06)] w-full sm:w-auto justify-center"
          style={{ border: "1.5px solid #1E293B" }}
        >
          See how it works
        </a>
      </div>

      {/* ── Trust signals ── */}
      <div className="relative flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 animate-[fadeInUp_0.6s_ease_0.4s_both]">
        {["No credit card required", "1 free AI diagnosis included", "Setup in under 5 minutes"].map((text) => (
          <span key={text} className="flex items-center gap-1.5 text-[13px] text-[#64748B]">
            <span className="text-[#3B82F6] font-bold text-[12px]">&#x2713;</span>
            {text}
          </span>
        ))}
      </div>

      {/* ── 2. Product screenshot with strong blue glow ── */}
      <div className="relative mt-16 w-full max-w-[1000px] mx-auto animate-[fadeInUp_0.8s_ease_0.5s_both]">
        {/* Blue glow — stronger, visible */}
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
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round"
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

      {/* ── 3. Social proof mini-bar ── */}
      <div className="relative flex flex-wrap justify-center gap-x-2 mt-12 animate-[fadeInUp_0.6s_ease_0.6s_both]">
        {["Built for SEO professionals", "Powered by Claude AI", "Free plan available"].map((text, i) => (
          <span key={text} className="flex items-center gap-2 text-[12px] text-[#475569] font-medium uppercase tracking-wider">
            {text}
            {i < 2 && <span className="text-[#1E293B]">&#x2022;</span>}
          </span>
        ))}
      </div>
    </section>
  );
}
