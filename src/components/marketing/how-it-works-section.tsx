"use client";

import { Radar, BrainCircuit, ListChecks, MousePointerClick, TrendingUp } from "lucide-react";
import { useFadeIn } from "@/hooks/use-fade-in";

const STEPS = [
  {
    step: 1,
    title: "Detect",
    desc: "Daily monitoring via Google Search Console. Decay score, velocity, seasonal filter. Pure math — zero AI cost.",
    icon: Radar,
    tag: "FREE \u00b7 AUTOMATIC",
    ai: false,
  },
  {
    step: 2,
    title: "Diagnose",
    desc: "AI analyzes your page vs. SERP competitors, content gaps, freshness, and technical issues. Specific causes with evidence.",
    icon: BrainCircuit,
    tag: "CLAUDE OPUS 4.6",
    ai: true,
  },
  {
    step: 3,
    title: "Recommend",
    desc: "Prioritized actions with micro-drafts: title suggestions, topics to cover, data to update. Write without researching.",
    icon: ListChecks,
    tag: "SPECIFIC ACTIONS",
    ai: true,
  },
  {
    step: 4,
    title: "Track",
    desc: 'Click "Already Updated" — we snapshot your metrics. Before/after comparison starts automatically.',
    icon: MousePointerClick,
    tag: "ONE CLICK",
    ai: false,
  },
  {
    step: 5,
    title: "Prove",
    desc: "28 days later, we measure results. Success, partial recovery, or no change — with exact numbers and deltas.",
    icon: TrendingUp,
    tag: "AUTOMATIC",
    ai: false,
  },
];

export default function HowItWorksSection() {
  const { ref, isVisible } = useFadeIn();

  return (
    <section className="relative bg-[#0A0E1A] py-28" id="features">
      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      <div
        ref={ref}
        className={`relative mx-auto max-w-[1200px] px-6 transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <p className="text-center text-[11px] font-bold tracking-[0.25em] text-[#0D9488]">
          HOW IT WORKS
        </p>
        <h2 className="mt-4 text-center text-[32px] font-extrabold tracking-[-0.02em] text-white sm:text-[40px]">
          The complete content rescue system.
        </h2>
        <p className="mx-auto mt-4 max-w-[500px] text-center text-[16px] leading-[1.7] text-[#94A3B8]">
          Five steps. Fully automated detection. AI-powered diagnosis. Measurable results.
        </p>

        {/* Steps — connector line on desktop */}
        <div className="relative mt-20">
          {/* Horizontal connector line (desktop only) */}
          <div className="absolute left-0 right-0 top-[52px] hidden h-[1px] bg-gradient-to-r from-transparent via-[#1E293B] to-transparent lg:block" />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className={`group relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] ${
                    step.ai
                      ? "border-[#7C3AED]/20 bg-[#7C3AED]/[0.03]"
                      : "border-[#1E293B] bg-[#111827]"
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${i * 100}ms` : "0ms",
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(20px)",
                  }}
                >
                  {/* Step circle */}
                  <div
                    className={`relative z-10 mb-5 flex h-[44px] w-[44px] items-center justify-center rounded-xl ${
                      step.ai ? "bg-[#7C3AED]/10" : "bg-[#0D9488]/10"
                    }`}
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.5}
                      className={step.ai ? "text-[#7C3AED]" : "text-[#0D9488]"}
                    />
                  </div>

                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold ${
                        step.ai ? "text-[#7C3AED]/60" : "text-[#0D9488]/60"
                      }`}
                    >
                      0{step.step}
                    </span>
                    <h3 className="text-[18px] font-bold text-white">{step.title}</h3>
                  </div>

                  <p className="mt-2 text-[13px] leading-[1.65] text-[#94A3B8]">{step.desc}</p>

                  {/* Tag */}
                  <div className="mt-5">
                    <span
                      className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] ${
                        step.ai
                          ? "bg-[#7C3AED]/10 text-[#A78BFA]"
                          : "bg-[#0D9488]/10 text-[#0D9488]"
                      }`}
                    >
                      {step.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
