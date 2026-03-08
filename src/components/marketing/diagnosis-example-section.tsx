"use client";

import { BrainCircuit, CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";
import { useFadeIn } from "@/hooks/use-fade-in";

const CAUSES = [
  {
    color: "border-l-[#DC2626]",
    title: "Outdated information",
    evidence:
      'Your "2024 pricing" section lists prices from March 2023. Top 3 competitors updated in the last 60 days with 2025 data.',
  },
  {
    color: "border-l-[#DC2626]",
    title: "Missing competitor features",
    evidence:
      "Competitors #1 and #2 now cover AI features (added Q4 2024). Your post doesn't mention AI capabilities at all.",
  },
  {
    color: "border-l-[#D97706]",
    title: "Thin content vs. SERP leaders",
    evidence:
      'Your post: 1,847 words. SERP average: 3,200 words. Missing sections: "Enterprise pricing", "Free alternatives", "Integration guides".',
  },
  {
    color: "border-l-[#D97706]",
    title: "Keyword cannibalization",
    evidence:
      'Two pages competing for "best project management tools": this page (pos. 14) and /project-management-comparison (pos. 22).',
  },
];

const ACTIONS = [
  {
    priority: "\ud83d\udd34",
    text: "Update all pricing data to 2025 figures",
    type: "Micro-draft: comparison table with 8 tools",
  },
  {
    priority: "\ud83d\udd34",
    text: 'Add "AI Features" section covering 5 tools',
    type: "Micro-draft: 400-word section with feature matrix",
  },
  {
    priority: "\ud83d\udd34",
    text: "Expand from 1,847 to ~3,000 words",
    type: "Micro-draft: 3 missing sections outlined",
  },
  {
    priority: "\ud83d\udfe1",
    text: 'Update title to "Best PM Tools (2025 Tested)"',
    type: "3 title variations provided",
  },
  {
    priority: "\ud83d\udfe1",
    text: "Add structured data (FAQ schema)",
    type: "Micro-draft: 5 FAQ Q&As ready to paste",
  },
  {
    priority: "\ud83d\udfe2",
    text: "Consolidate with /project-management-comparison",
    type: "301 redirect recommendation",
  },
];

export default function DiagnosisExampleSection() {
  const { ref, isVisible } = useFadeIn();

  return (
    <section className="bg-white py-28">
      <div
        ref={ref}
        className={`mx-auto max-w-[1200px] px-6 transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <p className="text-center text-[11px] font-bold tracking-[0.25em] text-[#7C3AED]">
          REAL EXAMPLE
        </p>
        <h2 className="mt-4 text-center text-[32px] font-extrabold tracking-[-0.02em] text-[#111827] sm:text-[40px]">
          See a real diagnosis in action.
        </h2>
        <p className="mx-auto mt-4 max-w-[520px] text-center text-[16px] leading-[1.7] text-[#6B7280]">
          This is what SerpVive produces for a single declining page. Specific causes. Specific
          fixes. Measurable results.
        </p>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Left — Diagnosis */}
          <div className="space-y-5">
            {/* Page header card */}
            <div className="rounded-2xl border border-[#7C3AED]/20 bg-[#FAFAFF] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED]/10">
                  <BrainCircuit size={16} strokeWidth={1.5} className="text-[#7C3AED]" />
                </div>
                <span className="text-[11px] font-bold tracking-[0.15em] text-[#7C3AED]">
                  AI DIAGNOSIS
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="rounded-md bg-[#DC2626]/10 px-3 py-1 text-[11px] font-bold tracking-wide text-[#DC2626]">
                  CRITICAL
                </span>
                <span className="font-mono text-[13px] text-[#6B7280]">
                  /best-project-management-tools-2024
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-mono text-[36px] font-extrabold leading-none text-[#DC2626]">
                  -47%
                </span>
                <span className="text-[14px] text-[#9CA3AF]">clicks in 90 days</span>
              </div>
            </div>

            {/* Causes */}
            <div>
              <p className="mb-3 text-[11px] font-bold tracking-[0.15em] text-[#9CA3AF]">
                ROOT CAUSES IDENTIFIED
              </p>
              <div className="space-y-2.5">
                {CAUSES.map((cause) => (
                  <div
                    key={cause.title}
                    className={`rounded-xl border border-[#E5E7EB] ${cause.color} border-l-[3px] bg-[#F8FAFC] px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]`}
                  >
                    <p className="text-[14px] font-semibold text-[#111827]">{cause.title}</p>
                    <p className="mt-1.5 text-[13px] leading-[1.6] text-[#6B7280]">
                      {cause.evidence}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Refresh Brief + Result */}
          <div className="space-y-5">
            {/* Actions */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <p className="text-[11px] font-bold tracking-[0.15em] text-[#9CA3AF]">
                REFRESH BRIEF — 6 PRIORITIZED ACTIONS
              </p>
              <div className="mt-5 space-y-4">
                {ACTIONS.map((action, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 text-[14px] leading-none">
                      {action.priority}
                    </span>
                    <div>
                      <p className="text-[14px] font-medium text-[#111827]">{action.text}</p>
                      <p className="mt-0.5 text-[12px] font-medium text-[#7C3AED]">
                        {action.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Result */}
            <div className="rounded-2xl border border-[#16A34A]/20 bg-[#F0FDF4] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16A34A]/10">
                  <TrendingUp size={16} strokeWidth={1.5} className="text-[#16A34A]" />
                </div>
                <span className="text-[11px] font-bold tracking-[0.15em] text-[#16A34A]">
                  RESULT AFTER 28 DAYS
                </span>
              </div>

              <div className="mt-5 flex items-center gap-5">
                <div className="text-center">
                  <p className="font-mono text-[32px] font-extrabold leading-none text-[#9CA3AF]">
                    167
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-[#9CA3AF]">Before</p>
                </div>
                <ArrowRight size={20} strokeWidth={1.5} className="text-[#D1D5DB]" />
                <div className="text-center">
                  <p className="font-mono text-[32px] font-extrabold leading-none text-[#16A34A]">
                    298
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-[#16A34A]">After</p>
                </div>
                <div className="ml-auto">
                  <span className="rounded-xl bg-[#16A34A]/10 px-4 py-2 font-mono text-[22px] font-extrabold text-[#16A34A]">
                    +78%
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <CheckCircle2 size={15} strokeWidth={2} className="text-[#16A34A]" />
                <span className="text-[13px] font-semibold text-[#16A34A]">
                  Recovery confirmed
                </span>
              </div>
            </div>

            {/* Quote */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center">
              <p className="text-[16px] font-medium leading-[1.6] text-[#6B7280]">
                Not &ldquo;optimize your content.&rdquo;
              </p>
              <p className="mt-1 text-[18px] font-bold text-[#111827]">
                Specific issues. Specific fixes. Measurable results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
