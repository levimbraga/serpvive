import { Reveal } from "@/hooks/useReveal";

const TRADITIONAL = [
  "Manual Google Analytics checks",
  "Spreadsheet tracking",
  "Generic 'update your content' advice",
  "No way to measure if fixes worked",
  "Hours of manual competitor research",
];

const SERPVIVE = [
  "Automatic daily decay detection",
  "AI-powered Health Score",
  "Specific fixes with evidence from SERP",
  "Automatic before/after measurement",
  "AI analyzes top 10 competitors in minutes",
];

export default function ComparisonSection() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-12 bg-white">
      <div className="max-w-[960px] mx-auto">
        <Reveal>
          <h2
            className="text-[32px] sm:text-[44px] lg:text-[52px] font-extrabold leading-[1.1] text-center text-[#0F172A] mb-4"
            style={{ letterSpacing: "-0.04em" }}
          >
            Traditional content audits vs{" "}
            <span className="text-[#3B82F6]">SerpVive</span>
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[16px] sm:text-[18px] text-[#64748B] leading-relaxed text-center max-w-[540px] mx-auto mb-14">
            Stop wasting hours on manual audits that give you vague advice.
          </p>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Traditional */}
            <div className="rounded-xl border border-[#E2E8F0] p-7 sm:p-9">
              <div className="flex items-center gap-2.5 mb-7">
                <div className="w-8 h-8 rounded-full bg-[#FEF2F2] flex items-center justify-center">
                  <span className="text-[#EF4444] text-[16px] font-bold">✗</span>
                </div>
                <h3 className="text-[18px] font-bold text-[#0F172A]">Traditional Audits</h3>
              </div>
              <ul className="flex flex-col gap-4">
                {TRADITIONAL.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#EF4444] text-[11px] font-bold">✗</span>
                    </span>
                    <span className="text-[15px] text-[#475569] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SerpVive */}
            <div className="rounded-xl border border-[#DBEAFE] p-7 sm:p-9" style={{ background: "#F8FAFF" }}>
              <div className="flex items-center gap-2.5 mb-7">
                <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                  <span className="text-[#22C55E] text-[16px] font-bold">✓</span>
                </div>
                <h3 className="text-[18px] font-bold text-[#0F172A]">SerpVive</h3>
              </div>
              <ul className="flex flex-col gap-4">
                {SERPVIVE.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#22C55E] text-[11px] font-bold">✓</span>
                    </span>
                    <span className="text-[15px] text-[#334155] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
