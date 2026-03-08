import { Reveal } from "@/hooks/useReveal";

const CAUSES = [
  { text: '1. Title says "2024"', detail: ' — all top 3 competitors say "2026". Google prefers current content.', severity: "high" },
  { text: "2. Missing AI section", detail: ' — top 3 results cover "AI features in PM tools." Your post doesn\'t mention AI once.', severity: "high" },
  { text: "3. Wrong pricing", detail: " — Monday.com listed at $8/seat. Actual price is $12/seat since March 2025.", severity: "high" },
  { text: "4. No comparison table", detail: " — 6 of 10 SERP results use comparison tables. Your post is text-only.", severity: "med" },
];

const ACTIONS = [
  { priority: "\uD83D\uDD34", text: 'Update title → "Best PM Tools in 2026 (Compared)"' },
  { priority: "\uD83D\uDD34", text: "Add ~400 word section about AI features in PM tools" },
  { priority: "\uD83D\uDD34", text: "Fix Monday.com pricing: $8 → $12/seat" },
  { priority: "\uD83D\uDFE1", text: "Add comparison table (12 tools × 6 columns)" },
  { priority: "\uD83D\uDFE1", text: "Fix 2 broken external links" },
  { priority: "\uD83D\uDFE2", text: "Update meta description with 2026 keywords" },
];

export default function ExampleSection() {
  return (
    <section className="px-5 py-[100px] sm:px-[48px]" style={{ background: "#FFFFFF" }}>
      <div className="mx-auto max-w-[900px]">
        <Reveal>
          <h2 className="mb-[12px] text-center text-[32px] font-[800] leading-[1.1] tracking-[-1px] text-[#0F172A] sm:text-[48px] sm:tracking-[-2px]">
            See a real diagnosis in action.
          </h2>
        </Reveal>
        <Reveal>
          <p className="mb-[52px] text-center text-[16px] text-[#64748B]">
            This is the level of detail you get. Not &quot;optimize your content.&quot;
          </p>
        </Reveal>

        <Reveal>
          <div className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] shadow-[0_20px_60px_rgba(0,0,0,0.07)]">
            {/* Header */}
            <div
              className="flex items-center gap-[12px] border-b border-[#E2E8F0] px-[24px] py-[18px]"
              style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(239,68,68,0.01))" }}
            >
              <span className="rounded-[5px] bg-[#EF4444] px-[12px] py-[4px] text-[11px] font-[700] text-white">CRITICAL</span>
              <span className="font-[family-name:var(--font-mono)] text-[13px] text-[#64748B]">/best-project-management-tools-2024</span>
              <span className="ml-auto text-[16px] font-[700] text-[#EF4444]">-47%</span>
            </div>

            {/* Body */}
            <div className="p-[28px]">
              {/* Summary */}
              <div className="mb-[20px] border-b border-[#E2E8F0] pb-[20px] text-[15px] leading-[1.65] text-[#475569]">
                This post lost 47% of its traffic because the content is outdated, 3 new competitors appeared with fresher information, and the search intent shifted to comparison-style content.
              </div>

              {/* Causes */}
              {CAUSES.map((cause) => (
                <div
                  key={cause.text}
                  className={`mb-[8px] rounded-[8px] bg-white p-[14px_18px] text-[13px] leading-[1.5] text-[#475569] shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${
                    cause.severity === "med" ? "border-l-[3px] border-l-[#F59E0B]" : "border-l-[3px] border-l-[#EF4444]"
                  }`}
                >
                  <strong className="text-[#0F172A]">{cause.text}</strong>
                  {cause.detail}
                </div>
              ))}

              {/* Refresh Brief */}
              <div className="mt-[24px] border-t border-[#E2E8F0] pt-[24px]">
                <div className="mb-[14px] text-[14px] font-[700] text-[#F97316]">
                  🔶 REFRESH BRIEF — 6 actions · ~2.5 hours
                </div>
                {ACTIONS.map((action) => (
                  <div key={action.text} className="flex items-start gap-[8px] py-[7px] text-[13px] leading-[1.4] text-[#475569]">
                    <span>{action.priority}</span>
                    {action.text}
                  </div>
                ))}
              </div>

              {/* Result */}
              <div className="mt-[24px] flex items-center justify-center gap-[18px] rounded-[10px] border border-[rgba(34,197,94,0.12)] p-[20px_24px] text-[18px] font-[600]" style={{ background: "rgba(34,197,94,0.05)" }}>
                <span className="text-[#94A3B8]">167 clicks/mo</span>
                <span className="text-[#94A3B8]">→</span>
                <span className="text-[#22C55E]">298 clicks/mo</span>
                <span className="text-[14px] text-[#22C55E]">(+78%) ✅</span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <p className="mt-[40px] text-center text-[16px] leading-[1.6] text-[#64748B]">
            <strong className="text-[#0F172A]">Specific issues. Specific fixes. Measurable results.</strong>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
