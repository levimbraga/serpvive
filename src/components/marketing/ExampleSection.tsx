import Link from "next/link";
import { Copy } from "lucide-react";
import { Reveal } from "@/hooks/useReveal";

const SEV = {
  high: { color: "#DC2626", bg: "#FEF2F2", label: "High" },
  medium: { color: "#D97706", bg: "#FFFBEB", label: "Medium" },
  low: { color: "#16A34A", bg: "#F0FDF4", label: "Low" },
} as const;

const PRI = {
  urgent: { color: "text-[#EF4444]", bg: "bg-[rgba(239,68,68,0.1)]", label: "Urgent" },
  important: { color: "text-[#F59E0B]", bg: "bg-[rgba(245,158,11,0.1)]", label: "Important" },
  nice_to_have: { color: "text-[#22C55E]", bg: "bg-[rgba(34,197,94,0.1)]", label: "Nice to have" },
} as const;

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
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-[0_4px_40px_rgba(0,0,0,0.06)] overflow-hidden max-w-[720px] mx-auto">

            {/* ── Header ── */}
            <div className="px-6 sm:px-8 py-5 border-b border-[#F1F5F9] relative" style={{ background: "#FAFBFC" }}>
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#16A34A] bg-[#16A34A]/10 border border-[#16A34A]/20 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  Live Analysis
                </span>
              </div>
              <p className="text-[13px] text-[#64748B] truncate mb-1 pr-28" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                /blog/jade-plant-care-guide
              </p>
              <p className="text-[12px] text-[#94A3B8]">
                Analyzed for: <span className="text-[#64748B] font-medium">jade succulent</span> <span className="text-[#94A3B8]">(custom keyword)</span>
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
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

            {/* ── Summary ── */}
            <div className="px-6 sm:px-8 pt-6 pb-5">
              <p className="text-[14px] sm:text-[15px] text-[#475569] leading-[1.7]">
                SERP #1 is an e-commerce page, #4 is Wikipedia, #5/#7 are YouTube, #10 is Amazon — only 2 of 10 results are care guides. Your 5,428-word guide outclasses every informational competitor, but &lsquo;jade succulent&rsquo; has mixed/transactional intent that Google rewards with product pages. Retargeting to &lsquo;jade plant care&rsquo; and doubling internal links from 16 to 40+ could capture ~80-150 clicks/month.
              </p>
            </div>

            {/* ── Topic Coverage ── */}
            <div className="px-6 sm:px-8 pb-5">
              <div className="bg-[#F9FAFB] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Topic Coverage</span>
                  <span className="text-[13px] font-semibold text-[#111827]">14 / 16 (88%)</span>
                </div>
                <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full bg-[#16A34A]" style={{ width: "88%" }} />
                </div>
                <p className="text-[12px] text-[#6B7280]">
                  <span className="font-medium text-[#374151]">Missing:</span> Where to buy jade plants / purchasing options (SERP #1 mountaincrestgardens.com and #10 Amazon dominate with this). Jade plant pricing / cost ranges by variety and size.
                </p>
              </div>
            </div>

            {/* ── Strengths ── */}
            <div className="px-6 sm:px-8 pb-5">
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-4">
                <p className="text-[10px] font-semibold text-[#166534] uppercase tracking-wider mb-2">What you&apos;re doing right</p>
                <ul className="space-y-2">
                  {[
                    "At 5,428 words with 60 headings, your guide is 2-3x more comprehensive than every informational competitor \u2014 SERP #3 has 2,323 words and SERP #2 has 2,360 words",
                    "Your 8-variety comparison table is unique in this SERP \u2014 no competitor offers a structured variety comparison, strong Featured Snippet and AI Overview citation candidate",
                    "The \u2018Quick Answer\u2019 box at the top directly matches Featured Snippet format \u2014 most extractable answer in the SERP",
                    "Structured troubleshooting section with emoji-coded problems covers every common issue mentioned across top competitors \u2014 all in one place",
                  ].map((s) => (
                    <li key={s} className="text-[13px] text-[#15803D] flex gap-2">
                      <span className="text-[#16A34A] flex-shrink-0 mt-0.5">&#x2713;</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Causes (ALL 5 with full descriptions + evidence) ── */}
            <div className="px-6 sm:px-8 pb-5 space-y-3">
              {([
                {
                  title: "Intent mismatch: \u2018jade succulent\u2019 triggers product/entity results, not care guides",
                  severity: "high" as const,
                  desc: "Only 2 of 10 SERP results are care guides. Google interprets this as a mixed-intent entity query. The SERP is dominated by commercial results: position #1 is mountaincrestgardens.com (product page), #4 is Wikipedia, #5 and #7 are YouTube, #10 is Amazon. Your primary keyword should be \u2018jade plant care\u2019 where care guides dominate positions #1-5.",
                  evidence: "SERP breakdown: 3 product/e-commerce pages, 2 YouTube videos, 1 Wikipedia, 1 classification article, 2 care guides, 1 university extension. Only 20% of slots match your content type.",
                },
                {
                  title: "Low internal linking (16 links) vs competitors with 27-50",
                  severity: "high" as const,
                  desc: "Your page has 16 internal links. SERP #1 has 43, SERP #2 has 50, SERP #3 has 27. For a pillar guide covering 8 varieties, propagation, soil, light, watering, and troubleshooting, you should have 35-50 internal links. You\u2019re missing links from each variety section to dedicated pages, from soil to pot drainage, and from troubleshooting to individual problem articles.",
                  evidence: "Your internal links: 16. SERP top-3 average: 40. You are 60% below the competitive average.",
                },
                {
                  title: "Title tag too long and care-focused for an entity keyword",
                  severity: "medium" as const,
                  desc: "Your title is 82 characters \u2014 will be truncated in SERPs. SERP #3 ranks with a concise 52-character title. Your \u20188 varieties\u2019 differentiator is invisible because it\u2019s buried. Shorten to ~55-60 chars: \u2018Jade Succulent: Complete Care Guide (8 Varieties + Fixes)\u2019.",
                  evidence: "SERP #1 title: ~28 chars. SERP #3: ~52 chars. Your title: ~82 chars, truncated to ~60.",
                },
                {
                  title: "No video content \u2014 2 of top 10 SERP positions are YouTube",
                  severity: "medium" as const,
                  desc: "SERP #5 and #7 are YouTube videos holding 20% of page-1 slots. Your page has zero embedded videos. Even a slideshow-style video would add dwell time and video schema eligibility.",
                  evidence: "2 of 10 SERP results are YouTube. Your page: 0 videos, 7 images.",
                },
                {
                  title: "External links point exclusively to Amazon \u2014 no authoritative botanical sources",
                  severity: "low" as const,
                  desc: "All 7 external links are Amazon affiliate. Zero citations to botanical gardens or university extensions. SERP #8 is extension.sdstate.edu and #9 is libguides.nybg.org \u2014 the authoritative sources you should be citing.",
                  evidence: "7 external links, all amzn.to. SERP #8 and #9 ARE the authoritative sources you\u2019re missing.",
                },
              ]).map((c) => {
                const sev = SEV[c.severity];
                return (
                  <div key={c.title} className="rounded-lg border border-[#E5E7EB] p-4" style={{ borderLeftWidth: 3, borderLeftColor: sev.color }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-[13px] sm:text-[14px] font-medium text-[#111827]">{c.title}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: sev.color, backgroundColor: sev.bg }}>
                        {sev.label}
                      </span>
                    </div>
                    <p className="text-[12px] sm:text-[13px] text-[#4B5563] leading-relaxed mb-2">{c.desc}</p>
                    <p className="text-[11px] sm:text-[12px] text-[#6B7280] italic leading-relaxed bg-[#F9FAFB] rounded-md p-2.5">
                      {c.evidence}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* ── Refresh Brief ── */}
            <div className="px-6 sm:px-8 pb-5">
              <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#F1F5F9] flex items-center gap-2" style={{ background: "#FAFBFC" }}>
                  <span className="text-[14px]">&#x2728;</span>
                  <span className="text-[13px] font-semibold text-[#0F172A]">Refresh Brief</span>
                  <span className="text-[11px] text-[#9CA3AF] ml-auto">Est. 4h total effort</span>
                </div>

                {/* Action 1 — EXPANDED with micro-draft */}
                <div className="border-b border-[#F1F5F9]">
                  <div className="px-4 py-3 flex items-center gap-2.5">
                    <span className={`text-[10px] font-medium ${PRI.urgent.color} ${PRI.urgent.bg} px-2 py-0.5 rounded-full flex-shrink-0`}>
                      {PRI.urgent.label}
                    </span>
                    <span className="text-[13px] font-medium text-[#111827] flex-1">Revise Title Tag for Better SERP Alignment</span>
                    <span className="text-[11px] text-[#9CA3AF] flex-shrink-0">20min</span>
                  </div>
                  <div className="px-4 pb-4 space-y-3">
                    <p className="text-[12px] sm:text-[13px] text-[#4B5563] leading-relaxed">
                      The current title is too long and care-focused for the mixed intent of &lsquo;jade succulent&rsquo;. Shortening and refocusing can improve CTR and stop the loss of ~2 clicks/day, recovering ~60 clicks/month.
                    </p>
                    {/* Micro-draft */}
                    <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-3 relative">
                      <div className="absolute top-2 right-2 p-1.5 rounded-md text-[#16A34A]">
                        <Copy size={13} strokeWidth={1.5} />
                      </div>
                      <p className="text-[10px] font-semibold text-[#16A34A] uppercase tracking-wider mb-2">Micro-draft: Title suggestions</p>
                      <div className="space-y-1 pr-8" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                        <p className="text-[13px] text-[#166534]">&rarr; Jade Succulent: Complete Care Guide (8 Varieties)</p>
                        <p className="text-[13px] text-[#166534]">&rarr; Jade Succulent Care: 8 Varieties &amp; Fixes</p>
                        <p className="text-[13px] text-[#166534]">&rarr; Jade Plant Care Guide 2026: Varieties &amp; Solutions</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#9CA3AF]">
                      Reference: joyusgarden.com uses a concise title that front-loads the primary keyword.
                    </p>
                  </div>
                </div>

                {/* Actions 2-4 — collapsed */}
                {([
                  { pri: "important" as const, title: "Increase Internal Linking to Boost Topical Authority", effort: "120min", cat: "structure" },
                  { pri: "important" as const, title: "Embed Video Content to Match SERP Trends", effort: "90min", cat: "content" },
                  { pri: "nice_to_have" as const, title: "Add Authoritative External Links", effort: "30min", cat: "content" },
                ]).map((a) => {
                  const p = PRI[a.pri];
                  return (
                    <div key={a.title} className="px-4 py-3 flex items-center gap-2.5 border-b border-[#F1F5F9] last:border-b-0">
                      <span className={`text-[10px] font-medium ${p.color} ${p.bg} px-2 py-0.5 rounded-full flex-shrink-0`}>
                        {p.label}
                      </span>
                      <span className="text-[13px] text-[#475569] truncate flex-1">{a.title}</span>
                      <span className="text-[11px] text-[#9CA3AF] flex-shrink-0">{a.effort}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Fade + CTA ── */}
            <div className="relative">
              <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-transparent to-white pointer-events-none" />
              <div className="px-6 sm:px-8 pb-8 pt-4 text-center">
                <p className="text-[14px] text-[#374151] mb-5 font-medium">
                  This is a real analysis of a live blog post — not a mockup.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors"
                  >
                    Get Started Free &rarr;
                  </Link>
                  <Link
                    href="/#pricing"
                    className="inline-flex items-center justify-center h-11 px-8 rounded-lg border border-[#E5E7EB] hover:border-[#3B82F6] text-[#374151] text-sm font-medium transition-colors"
                  >
                    See Pricing
                  </Link>
                </div>
                <p className="text-xs text-[#9CA3AF]">No credit card required</p>
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
