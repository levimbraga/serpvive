import { Reveal } from "@/hooks/useReveal";

type Step = {
  num: number;
  title: string;
  desc: string;
  ai: boolean;
  tag: string;
  tagStyle: string;
};

const STEPS: Step[] = [
  { num: 1, title: "DETECT", desc: "Monitor every page daily. Know the moment traffic drops.", ai: false, tag: "FREE \u00B7 AUTOMATIC", tagStyle: "bg-[rgba(34,197,94,0.08)] text-[#22C55E]" },
  { num: 2, title: "DIAGNOSE", desc: "AI analyzes SERP, competitors & your content. Explains WHY.", ai: true, tag: "CLAUDE OPUS 4.6", tagStyle: "bg-[rgba(249,115,22,0.12)] text-[#FB923C]" },
  { num: 3, title: "RECOMMEND", desc: '\u201CChange title to X, add section about Y, fix price Z.\u201D', ai: true, tag: "MICRO-DRAFTS", tagStyle: "bg-[rgba(249,115,22,0.12)] text-[#FB923C]" },
  { num: 4, title: "TRACK", desc: "Mark your post as updated. We snapshot the metrics.", ai: false, tag: "ONE CLICK", tagStyle: "bg-[rgba(59,130,246,0.15)] text-[#60A5FA]" },
  { num: 5, title: "PROVE", desc: "28 days later: automatic before vs after. Did it work?", ai: false, tag: "AUTOMATIC", tagStyle: "bg-[rgba(59,130,246,0.15)] text-[#60A5FA]" },
];

export default function StepsSection() {
  return (
    <section id="features" className="px-5 py-[100px] sm:px-[48px]" style={{ background: "#07090F" }}>
      <div className="mx-auto max-w-[1240px]">
        <Reveal>
          <h2 className="mb-[12px] text-center text-[32px] font-[800] leading-[1.1] tracking-[-1px] text-[#F1F5F9] sm:text-[48px] sm:tracking-[-2px]">
            The complete content rescue system.
          </h2>
        </Reveal>
        <Reveal>
          <p className="mb-[52px] text-center text-[16px] text-[#64748B]">No other tool does all 5 steps.</p>
        </Reveal>

        {/* 5 steps: 5-col on desktop, 3-col tablet, 1-col mobile */}
        <div className="mb-[48px] grid grid-cols-1 gap-[14px] sm:grid-cols-3 xl:grid-cols-5">
          {STEPS.map((step) => (
            <Reveal key={step.num}>
              <div
                className={`relative rounded-[14px] bg-[#0F1219] p-[28px_18px] text-center transition-all duration-300 hover:-translate-y-[4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] ${
                  step.ai
                    ? "border border-[rgba(249,115,22,0.2)] hover:border-[#F97316]"
                    : "border border-[#1E293B] hover:border-[#3B82F6]"
                }`}
              >
                <div
                  className={`mx-auto mb-[16px] flex h-[40px] w-[40px] items-center justify-center rounded-full text-[16px] font-[700] text-white ${
                    step.ai ? "bg-[#F97316]" : "bg-[#3B82F6]"
                  }`}
                >
                  {step.num}
                </div>
                <h3 className="mb-[10px] text-[14px] font-[700] tracking-[0.5px] text-[#F1F5F9]">{step.title}</h3>
                <p className="text-[12px] leading-[1.5] text-[#94A3B8]">{step.desc}</p>
                <span className={`mt-[14px] inline-block rounded-[5px] px-[10px] py-[4px] text-[10px] font-[600] ${step.tagStyle}`}>
                  {step.tag}
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="text-center">
          <a
            href="#waitlist"
            className="inline-flex items-center gap-[10px] rounded-[10px] bg-[#3B82F6] px-[36px] py-[16px] text-[16px] font-[600] text-white no-underline transition-all duration-[250ms] hover:-translate-y-[2px] hover:bg-[#2563EB] hover:shadow-[0_8px_40px_rgba(59,130,246,0.15)]"
          >
            Join the Waitlist →
          </a>
        </div>
      </div>
    </section>
  );
}
