"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/hooks/useReveal";

const faqs = [
  {
    q: "What access does SerpVive need?",
    a: "Read-only Google Search Console. We never modify your site or data. You can disconnect anytime from Settings.",
  },
  {
    q: "How is this different from Ahrefs or Semrush?",
    a: "They show you data. We tell you WHY your post is declining and exactly WHAT to update, with ready-to-use drafts. No spreadsheets, no guesswork.",
  },
  {
    q: "How accurate is the AI diagnosis?",
    a: "Powered by Claude Opus 4.6. Analyzes live SERP results + 3 competitor pages + your content. Every cause includes specific evidence with SERP positions, word counts, and competitor URLs.",
  },
  {
    q: "Can I use this for client blogs?",
    a: "Yes. Pro supports 3 sites, Agency supports 10. Each site gets its own dashboard, Health Score, and diagnosis history.",
  },
  {
    q: "What if my blog has no decaying posts?",
    a: "Great! Your Health Score will reflect that. You\u2019ll still get daily monitoring so you catch decline early \u2014 before it costs you traffic.",
  },
  {
    q: "How does the free plan work?",
    a: "Connect Google Search Console, see your Health Score, and get 1 AI diagnosis for free. Upgrade anytime for more diagnoses and daily monitoring.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<Set<number>>(new Set());

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-12 bg-[#F5F7FA]">
      <div className="mx-auto" style={{ maxWidth: "min(720px, 85vw)" }}>
        <Reveal>
          <h2
            className="font-extrabold leading-[1.1] text-center text-[#0F172A] mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.04em" }}
          >
            Frequently asked questions
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[16px] sm:text-[18px] text-[#64748B] leading-relaxed text-center max-w-[480px] mx-auto mb-12">
            Everything you need to know before getting started.
          </p>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open.has(i);
            return (
              <Reveal key={faq.q}>
                <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
                  <button
                    onClick={() => setOpen((prev) => { const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next; })}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-[15px] font-medium text-[#0F172A]">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      strokeWidth={1.5}
                      className={`text-[#94A3B8] flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4">
                      <p className="text-[14px] text-[#475569] leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
