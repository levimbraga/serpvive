import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Changelog — SerpVive",
  description: "What's new in SerpVive — product updates and releases.",
};

const ENTRIES = [
  {
    date: "March 2026",
    title: "Launch",
    tag: "v1.0",
    tagColor: "#3B82F6",
    items: [
      "AI-powered content decay monitoring with Health Score (0–100) for every site.",
      "Decay Score and velocity tracking for every page — know exactly what's declining and how fast.",
      "Seasonal detection to distinguish real decay from natural traffic dips.",
      "AI diagnosis powered by Claude Opus 4.6 — reads your top competitors and explains WHY your content is losing traffic, with evidence.",
      "Refresh Briefs with micro-drafts — specific fixes, ready-to-use title suggestions, missing topics, corrected data, and time estimates.",
      "Automatic result tracking — snapshot metrics when you mark a page as updated, measure before vs after in 28 days.",
      "Google Search Console integration with read-only access.",
      "Cannibalization detection — find when your own pages compete for the same keywords.",
      "Weekly email digest with your site's health summary.",
      "4 plans: Free, Starter ($29/mo), Pro ($69/mo), Agency ($129/mo).",
      "Analyze any URL — paste any page + keyword for a full AI diagnosis, no GSC required.",
      "External analysis — analyze competitor pages or client prospects.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <Navbar />

      {/* Dark hero */}
      <section
        className="pt-[140px] sm:pt-[160px] pb-12 px-5 sm:px-12 text-center"
        style={{ background: "#07090F" }}
      >
        <h1
          className="text-[32px] sm:text-[44px] font-extrabold text-white mb-3"
          style={{ letterSpacing: "-0.04em" }}
        >
          Changelog
        </h1>
        <p className="text-[16px] text-[#94A3B8]">
          What&apos;s new in SerpVive.
        </p>
      </section>

      {/* Timeline */}
      <section className="bg-white px-5 sm:px-12 py-16 sm:py-20">
        <div className="max-w-[700px] mx-auto">
          {ENTRIES.map((entry, i) => (
            <div key={i} className="relative pl-8 pb-12 last:pb-0">
              {/* Timeline line */}
              {i < ENTRIES.length - 1 && (
                <div className="absolute left-[7px] top-[28px] bottom-0 w-px bg-[#E5E7EB]" />
              )}

              {/* Timeline dot */}
              <div
                className="absolute left-0 top-[6px] w-[15px] h-[15px] rounded-full border-[3px] border-white"
                style={{ background: entry.tagColor, boxShadow: `0 0 0 2px ${entry.tagColor}30` }}
              />

              {/* Date + tag */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[14px] font-semibold text-[#111827]">{entry.date}</span>
                <span
                  className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white"
                  style={{ background: entry.tagColor }}
                >
                  {entry.tag}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111827] mb-4" style={{ letterSpacing: "-0.02em" }}>
                {entry.title}
              </h2>

              {/* Items */}
              <ul className="space-y-2.5">
                {entry.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#3B82F6] flex-shrink-0" />
                    <span className="text-[15px] text-[#374151] leading-[1.7]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
