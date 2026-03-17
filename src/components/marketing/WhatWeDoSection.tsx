import { Reveal } from "@/hooks/useReveal";
import { Activity, TrendingDown, Brain, BarChart3 } from "lucide-react";

const BLOCKS = [
  {
    icon: Activity,
    title: "Monitors every page, every day",
    body: "Connect your Google Search Console. We track clicks, impressions, positions, and CTR for every page \u2014 automatically. No spreadsheets.",
    hero: false,
  },
  {
    icon: TrendingDown,
    title: "Detects the moment traffic drops",
    body: "Each page gets a Decay Score. Your blog gets a Health Score (0\u2013100). When something drops, you know immediately \u2014 plus weekly email alerts.",
    hero: false,
  },
  {
    icon: Brain,
    title: "AI explains WHY and tells you WHAT to fix",
    body: "Click \u2018Diagnose\u2019 and our AI does in 2\u20133 minutes what takes hours manually:",
    bullets: [
      "Searches Google for your keyword",
      "Reads the top 3 competitors beating you",
      "Compares their content with yours",
      "Delivers specific causes with evidence",
      "Provides ready-to-use title suggestions, missing topics, corrected data, and time estimates",
    ],
    hero: true,
  },
  {
    icon: BarChart3,
    title: "Measures if your fixes actually worked",
    body: "Updated your post? We snapshot the metrics. 28 days later: clicks before vs after, position before vs after. Concrete proof.",
    hero: false,
  },
];

export default function WhatWeDoSection() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-12 bg-white">
      <div className="max-w-[960px] mx-auto">
        <Reveal>
          <h2
            className="text-[32px] sm:text-[44px] lg:text-[52px] font-extrabold leading-[1.1] text-center text-[#0F172A] mb-4"
            style={{ letterSpacing: "-0.04em" }}
          >
            What SerpVive actually does
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[16px] sm:text-[18px] text-[#64748B] leading-relaxed text-center max-w-[440px] mx-auto mb-14">
            Four things, done automatically, every day.
          </p>
        </Reveal>

        {/* Grid: 2x2 on desktop, 1 col on mobile. Hero block spans 2 cols */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BLOCKS.map((block) => {
            const Icon = block.icon;
            if (block.hero) {
              return (
                <Reveal key={block.title} className="md:col-span-2">
                  <div className="rounded-xl border border-[#E2E8F0] bg-white p-7 sm:p-9 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-l-[4px] border-l-[#7C3AED] md:col-span-2">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-lg bg-[#F5F3FF] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#7C3AED]" strokeWidth={1.5} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-[#7C3AED] px-3 py-1 rounded-full">
                        AI-Powered
                      </span>
                    </div>
                    <h3 className="text-[20px] sm:text-[22px] font-bold text-[#0F172A] mb-3">
                      {block.title}
                    </h3>
                    <p className="text-[15px] text-[#334155] leading-relaxed mb-4">
                      {block.body}
                    </p>
                    {block.bullets && (
                      <ul className="flex flex-col gap-2">
                        {block.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2.5">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#7C3AED] flex-shrink-0" />
                            <span className="text-[14px] text-[#475569] leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Reveal>
              );
            }

            return (
              <Reveal key={block.title}>
                <div className="rounded-xl border border-[#E2E8F0] bg-white p-7 sm:p-9 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] h-full">
                  <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-[#3B82F6]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#0F172A] mb-3">
                    {block.title}
                  </h3>
                  <p className="text-[15px] text-[#334155] leading-relaxed">
                    {block.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Note below grid */}
        <Reveal>
          <p className="text-center mt-10 text-[15px] text-[#64748B] max-w-[560px] mx-auto">
            Fix it now. See your new diagnosis immediately. Results are measured automatically after 28 days.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
