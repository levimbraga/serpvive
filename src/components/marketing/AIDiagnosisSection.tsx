import { Reveal } from "@/hooks/useReveal";
import { X, Check, Zap, Globe, FileText } from "lucide-react";

const OTHER_TOOLS = [
  "Your content is outdated",
  "Add more keywords",
  "Improve readability score",
];

const SERPVIVE_SAYS = [
  "Monday.com price listed as $8/seat is wrong \u2014 current price is $12/seat since March 2025. Competitor #2 already updated theirs.",
  "Top 3 competitors all have a comparison table with 5+ tools. You compare only 3. Here are the columns to add.",
  "Your title says \u20182024\u2019. All top 3 results say \u20182026\u2019. Here are 3 title suggestions ready to copy.",
];

const USE_CASES = [
  {
    icon: Zap,
    title: "Full monitoring (GSC connected)",
    desc: "Health Score, decay alerts, AI diagnosis, automatic result tracking",
  },
  {
    icon: FileText,
    title: "Analyze your own pages (no GSC)",
    desc: "Paste URL + keyword. Get full AI diagnosis vs competitors.",
  },
  {
    icon: Globe,
    title: "Analyze any URL",
    desc: "Check competitor pages, client prospects, any blog. Same AI power.",
  },
];

export default function AIDiagnosisSection() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-12" style={{ background: "#0C0F18" }}>
      <div className="max-w-[1200px] mx-auto">
        {/* Heading */}
        <Reveal>
          <h2
            className="font-extrabold leading-[1.1] text-center mb-4"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 3.5rem)", letterSpacing: "-0.04em" }}
          >
            Not &ldquo;optimize your content.&rdquo;
            <br />
            <span className="text-[#3B82F6]">We tell you exactly what&apos;s wrong — with evidence.</span>
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[16px] sm:text-[18px] text-[#94A3B8] leading-relaxed text-center max-w-[540px] mx-auto mb-14">
            The difference between generic advice and actionable intelligence.
          </p>
        </Reveal>

        {/* Comparison: Other tools vs SerpVive */}
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-14">
            {/* Other tools */}
            <div
              className="rounded-xl p-7 sm:p-9 border border-[#1E293B]"
              style={{ background: "#0F1219" }}
            >
              <h3 className="text-[16px] font-bold text-[#EF4444] mb-6 uppercase tracking-wide">
                What other tools say:
              </h3>
              <ul className="flex flex-col gap-5">
                {OTHER_TOOLS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center flex-shrink-0">
                      <X className="w-3.5 h-3.5 text-[#EF4444]" strokeWidth={2.5} />
                    </span>
                    <span className="text-[15px] text-[#475569] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SerpVive */}
            <div
              className="rounded-xl p-7 sm:p-9 border border-[rgba(59,130,246,0.3)]"
              style={{ background: "rgba(59,130,246,0.04)" }}
            >
              <h3 className="text-[16px] font-bold text-[#3B82F6] mb-6 uppercase tracking-wide">
                What SerpVive says:
              </h3>
              <ul className="flex flex-col gap-5">
                {SERPVIVE_SAYS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-[rgba(59,130,246,0.12)] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#3B82F6]" strokeWidth={2.5} />
                    </span>
                    <span className="text-[15px] text-[#F1F5F9] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        {/* Powered by badge + detail text */}
        <Reveal>
          <div className="text-center mb-16">
            <span className="inline-block text-[12px] font-bold uppercase tracking-wider text-white bg-[#7C3AED] px-4 py-1.5 rounded-full mb-4">
              Powered by Claude Opus 4.6
            </span>
            <p className="text-[14px] sm:text-[15px] text-[#94A3B8] leading-[1.7] max-w-[620px] mx-auto">
              Every diagnosis includes: causes with evidence, topic coverage score, competitor references, ready-to-use title suggestions, and time estimates for each fix.
            </p>
          </div>
        </Reveal>

        {/* Three ways to use SerpVive */}
        <Reveal>
          <div className="text-center mb-10">
            <h3 className="text-[24px] sm:text-[30px] font-extrabold text-[#F1F5F9] mb-2" style={{ letterSpacing: "-0.03em" }}>
              Three ways to use SerpVive
            </h3>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {USE_CASES.map((uc) => {
            const Icon = uc.icon;
            return (
              <Reveal key={uc.title}>
                <div
                  className="rounded-xl p-6 sm:p-7 border border-[#1E293B] transition-all duration-300 hover:border-[#334155] hover:-translate-y-0.5 h-full"
                  style={{ background: "#0F1219" }}
                >
                  <div className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.1)] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#3B82F6]" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-[15px] font-bold text-[#F1F5F9] mb-2">
                    {uc.title}
                  </h4>
                  <p className="text-[13px] text-[#94A3B8] leading-relaxed">
                    {uc.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
