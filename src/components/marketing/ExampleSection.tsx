import { Reveal } from "@/hooks/useReveal";

export default function ExampleSection() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-12 bg-white">
      <div className="max-w-[800px] mx-auto">
        <Reveal>
          <h2
            className="text-[32px] sm:text-[44px] lg:text-[52px] font-extrabold leading-[1.1] text-center text-[#0F172A] mb-4"
            style={{ letterSpacing: "-0.04em" }}
          >
            See a real diagnosis in action.
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[16px] sm:text-[18px] text-[#64748B] leading-relaxed text-center max-w-[540px] mx-auto mb-14">
            This is the level of detail you get. Not &quot;optimize your content.&quot;
          </p>
        </Reveal>

        {/* Diagnosis card */}
        <Reveal>
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-[0_4px_40px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 px-6 sm:px-8 py-5 border-b border-[#F1F5F9]" style={{ background: "#FAFBFC" }}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-[#EF4444] px-3 py-1 rounded">
                CRITICAL
              </span>
              <span
                className="text-[13px] text-[#64748B] truncate"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              >
                /best-project-management-tools-2024
              </span>
              <span className="text-[14px] font-bold text-[#EF4444] ml-auto">
                -47%
              </span>
            </div>

            {/* Body */}
            <div className="px-6 sm:px-8 py-7">
              {/* Summary */}
              <p className="text-[14px] sm:text-[15px] text-[#475569] leading-[1.7] mb-7">
                This post lost 47% of its traffic because the content is outdated,
                3 new competitors appeared with fresher information, and the search
                intent shifted to comparison-style content.
              </p>

              {/* Causes */}
              <div className="flex flex-col gap-3 mb-7">
                <div className="rounded-lg px-5 py-3.5 border-l-[3px] border-l-[#EF4444]" style={{ background: "#FEF2F2" }}>
                  <p className="text-[14px] text-[#334155] leading-relaxed">
                    <strong className="text-[#0F172A]">1. Title says &quot;2024&quot;</strong> — all top 3 competitors say &quot;2026&quot;. Google prefers current content.
                  </p>
                </div>
                <div className="rounded-lg px-5 py-3.5 border-l-[3px] border-l-[#EF4444]" style={{ background: "#FEF2F2" }}>
                  <p className="text-[14px] text-[#334155] leading-relaxed">
                    <strong className="text-[#0F172A]">2. Missing AI section</strong> — top 3 results cover &quot;AI features in PM tools.&quot; Your post doesn&apos;t mention AI once.
                  </p>
                </div>
                <div className="rounded-lg px-5 py-3.5 border-l-[3px] border-l-[#EF4444]" style={{ background: "#FEF2F2" }}>
                  <p className="text-[14px] text-[#334155] leading-relaxed">
                    <strong className="text-[#0F172A]">3. Wrong pricing</strong> — Monday.com listed at $8/seat. Actual price is $12/seat since March 2025.
                  </p>
                </div>
                <div className="rounded-lg px-5 py-3.5 border-l-[3px] border-l-[#F59E0B]" style={{ background: "#FFFBEB" }}>
                  <p className="text-[14px] text-[#334155] leading-relaxed">
                    <strong className="text-[#0F172A]">4. No comparison table</strong> — 6 of 10 SERP results use comparison tables. Your post is text-only.
                  </p>
                </div>
              </div>

              {/* Refresh brief */}
              <div className="rounded-xl border border-[#E2E8F0] overflow-hidden mb-7">
                <div className="px-5 py-3.5 border-b border-[#F1F5F9] flex items-center gap-2" style={{ background: "#FAFBFC" }}>
                  <span className="text-[14px]">&#x1F536;</span>
                  <span className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wide">
                    Refresh Brief — 6 actions · ~2.5 hours
                  </span>
                </div>
                <div className="px-5 py-4 flex flex-col gap-2.5">
                  {[
                    { priority: "high", dot: "bg-[#DC2626]", text: 'Update title \u2192 "Best PM Tools in 2026 (Compared)"' },
                    { priority: "high", dot: "bg-[#DC2626]", text: "Add ~400 word section about AI features in PM tools" },
                    { priority: "high", dot: "bg-[#DC2626]", text: "Fix Monday.com pricing: $8 \u2192 $12/seat" },
                    { priority: "med", dot: "bg-[#D97706]", text: "Add comparison table (12 tools \u00D7 6 columns)" },
                    { priority: "med", dot: "bg-[#D97706]", text: "Fix 2 broken external links" },
                    { priority: "low", dot: "bg-[#16A34A]", text: "Update meta description with 2026 keywords" },
                  ].map((action) => (
                    <div key={action.text} className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${action.dot}`} />
                      <span className="text-[13px] sm:text-[14px] text-[#475569] leading-relaxed">{action.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Result */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 py-4 rounded-xl" style={{ background: "#F0FDF4" }}>
                <span className="text-[16px] sm:text-[18px] font-bold text-[#64748B]">167 clicks/mo</span>
                <span className="text-[#94A3B8]">&rarr;</span>
                <span className="text-[16px] sm:text-[18px] font-bold text-[#22C55E]">298 clicks/mo</span>
                <span className="text-[14px] font-bold text-[#22C55E]">(+78%)</span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <p className="text-center mt-10 text-[15px] sm:text-[16px] text-[#334155]">
            <strong className="text-[#0F172A]">Specific issues. Specific fixes. Measurable results.</strong>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
