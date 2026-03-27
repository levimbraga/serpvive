import Link from "next/link";
import { Reveal } from "@/hooks/useReveal";

const SEVERITY = {
  high: { color: "#DC2626", bg: "#FEF2F2", label: "High" },
  medium: { color: "#D97706", bg: "#FFFBEB", label: "Medium" },
  low: { color: "#16A34A", bg: "#F0FDF4", label: "Low" },
} as const;

const PRIORITY = {
  urgent: { color: "text-[#EF4444]", bg: "bg-[rgba(239,68,68,0.1)]", label: "Urgent" },
  important: { color: "text-[#F59E0B]", bg: "bg-[rgba(245,158,11,0.1)]", label: "Important" },
  nice_to_have: { color: "text-[#22C55E]", bg: "bg-[rgba(34,197,94,0.1)]", label: "Nice to have" },
} as const;

const causes = [
  {
    title: "Intent mismatch: 'jade succulent' triggers product/entity results, not care guides",
    severity: "high" as const,
    description: "Only 2 of 10 SERP results are care guides. Google interprets this as a mixed-intent query. Your primary keyword should be 'jade plant care' where care guides dominate positions #1-5.",
  },
  {
    title: "Low internal linking (16 links) vs competitors with 27-50",
    severity: "high" as const,
    description: "SERP #1 has 43 internal links, SERP #2 has 50, SERP #3 has 27. Your 16 internal links signal weak topical authority.",
  },
  {
    title: "Title tag too long and care-focused for an entity keyword",
    severity: "medium" as const,
    description: "Your 82-character title will be truncated. SERP #3 ranks with 52 characters. Shorten to ~55-60 chars.",
  },
  {
    title: "No video content — 2 of top 10 SERP positions are YouTube",
    severity: "medium" as const,
    description: "YouTube holds 20% of page-1 slots. Even a slideshow-style video would add dwell time and video schema eligibility.",
  },
  {
    title: "External links point exclusively to Amazon — no authoritative botanical sources",
    severity: "low" as const,
    description: "All 7 external links are Amazon affiliate. Zero citations to botanical gardens or university extensions.",
  },
];

const briefActions = [
  { priority: "urgent" as const, title: "Revise Title Tag for Better SERP Alignment", effort: "20min" },
  { priority: "important" as const, title: "Increase Internal Linking to 40+", effort: "120min" },
  { priority: "important" as const, title: "Embed Video Content to Match SERP Trends", effort: "90min" },
  { priority: "nice_to_have" as const, title: "Add Authoritative External Links", effort: "30min" },
];

const strengths = [
  "5,428 words with 60 headings — 2-3x more comprehensive than every informational competitor",
  "8-variety comparison table unique in this SERP — strong Featured Snippet candidate",
  "Quick Answer box at top directly matches Featured Snippet format",
  "Structured troubleshooting section with emoji-coded problems covers every common issue",
];

export default function ExampleSection() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-12 bg-white">
      <div className="mx-auto" style={{ maxWidth: "min(1100px, 85vw)" }}>
        <Reveal>
          <h2
            className="font-extrabold leading-[1.1] text-center text-[#0F172A] mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 4rem)", letterSpacing: "-0.04em" }}
          >
            See a real diagnosis in action.
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[16px] sm:text-[18px] text-[#64748B] leading-relaxed text-center max-w-[540px] mx-auto mb-14">
            This is the level of detail you get. Not &quot;optimize your content.&quot;
          </p>
        </Reveal>

        <Reveal>
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-[0_4px_40px_rgba(0,0,0,0.06)] overflow-hidden max-w-[720px] mx-auto relative">

            {/* Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-2.5 py-1 rounded-full">
                Real Analysis
              </span>
            </div>

            {/* Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-[#F1F5F9]" style={{ background: "#FAFBFC" }}>
              <p
                className="text-[13px] text-[#64748B] truncate mb-1"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              >
                /blog/jade-plant-care-guide
              </p>
              <p className="text-[12px] text-[#94A3B8]">
                Analyzed for: <span className="text-[#64748B] font-medium">jade succulent</span>{" "}
                <span className="text-[#94A3B8]">(custom keyword)</span>
              </p>
              <div className="flex gap-6 mt-3">
                {[
                  { label: "Clicks (28d)", value: "1" },
                  { label: "Impressions", value: "174" },
                  { label: "Avg Position", value: "#54" },
                ].map((m) => (
                  <div key={m.label}>
                    <p className="text-[10px] uppercase tracking-wider text-[#94A3B8]">{m.label}</p>
                    <p className="text-[15px] font-semibold text-[#0F172A]">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="px-6 sm:px-8 pt-6 pb-5">
              <p className="text-[14px] sm:text-[15px] text-[#475569] leading-[1.7]">
                SERP #1 is an e-commerce page, #4 is Wikipedia, #5/#7 are YouTube, #10 is Amazon — only 2 of 10 results are care guides. Your 5,428-word guide outclasses every informational competitor, but &lsquo;jade succulent&rsquo; has mixed/transactional intent that Google rewards with product pages. Retargeting to &lsquo;jade plant care&rsquo; and doubling internal links from 16 to 40+ could capture ~80-150 clicks/month.
              </p>
            </div>

            {/* Topic Coverage */}
            <div className="px-6 sm:px-8 pb-5">
              <div className="bg-[#F9FAFB] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Topic Coverage</span>
                  <span className="text-[13px] font-semibold text-[#111827]">14 / 16 (88%)</span>
                </div>
                <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#16A34A]" style={{ width: "88%" }} />
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div className="px-6 sm:px-8 pb-5">
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-4">
                <p className="text-[10px] font-semibold text-[#166534] uppercase tracking-wider mb-2">What you&apos;re doing right</p>
                <ul className="space-y-1.5">
                  {strengths.map((s) => (
                    <li key={s} className="text-[13px] text-[#15803D] flex gap-2">
                      <span className="text-[#16A34A] flex-shrink-0">&#x2713;</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Causes */}
            <div className="px-6 sm:px-8 pb-5 space-y-2.5">
              {causes.map((cause) => {
                const sev = SEVERITY[cause.severity];
                return (
                  <div key={cause.title} className="rounded-lg border border-[#E5E7EB] p-4" style={{ borderLeftWidth: 3, borderLeftColor: sev.color }}>
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="text-[13px] sm:text-[14px] font-medium text-[#111827]">{cause.title}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: sev.color, backgroundColor: sev.bg }}>
                        {sev.label}
                      </span>
                    </div>
                    <p className="text-[12px] sm:text-[13px] text-[#6B7280] leading-relaxed">{cause.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Refresh Brief — all 4 actions visible */}
            <div className="px-6 sm:px-8 pb-5">
              <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center gap-2" style={{ background: "#FAFBFC" }}>
                  <span className="text-[13px] font-semibold text-[#0F172A]">Refresh Brief</span>
                  <span className="text-[11px] text-[#9CA3AF]">Est. 4h total effort</span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {briefActions.map((a) => {
                    const pri = PRIORITY[a.priority];
                    return (
                      <div key={a.title} className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-medium ${pri.color} ${pri.bg} px-2 py-0.5 rounded-full flex-shrink-0`}>
                          {pri.label}
                        </span>
                        <span className="text-[13px] text-[#475569] truncate flex-1">{a.title}</span>
                        <span className="text-[11px] text-[#9CA3AF] flex-shrink-0">{a.effort}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Fade overlay + CTA */}
            <div className="relative">
              <div className="absolute inset-x-0 -top-20 h-20 bg-gradient-to-b from-transparent to-white pointer-events-none" />
              <div className="px-6 sm:px-8 pb-8 pt-4 text-center">
                <p className="text-[14px] text-[#374151] mb-4 font-medium">
                  This is a real analysis. Get yours in 5 minutes.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors"
                >
                  Get Started Free &rarr;
                </Link>
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
