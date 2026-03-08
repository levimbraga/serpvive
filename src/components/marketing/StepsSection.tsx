import { Reveal } from "@/hooks/useReveal";

type StepData = {
  num: number;
  title: string;
  desc: string;
  tag: string;
  tagStyle: string;
  ai?: boolean;
};

const STEPS: StepData[] = [
  { num: 1, title: "DETECT", desc: "Monitor every page daily. Know the moment traffic drops.", tag: "FREE · AUTOMATIC", tagStyle: "bg-[rgba(34,197,94,0.08)] text-[#22C55E]" },
  { num: 2, title: "DIAGNOSE", desc: "AI analyzes SERP, competitors & your content. Explains WHY.", tag: "CLAUDE OPUS 4.6", tagStyle: "bg-[rgba(249,115,22,0.12)] text-[#FB923C]", ai: true },
  { num: 3, title: "RECOMMEND", desc: '"Change title to X, add section about Y, fix price Z."', tag: "MICRO-DRAFTS", tagStyle: "bg-[rgba(249,115,22,0.12)] text-[#FB923C]", ai: true },
  { num: 4, title: "TRACK", desc: "Mark your post as updated. We snapshot the metrics.", tag: "ONE CLICK", tagStyle: "bg-[rgba(59,130,246,0.15)] text-[#60A5FA]" },
  { num: 5, title: "PROVE", desc: "28 days later: automatic before vs after. Did it work?", tag: "AUTOMATIC", tagStyle: "bg-[rgba(59,130,246,0.15)] text-[#60A5FA]" },
];

export default function StepsSection() {
  return (
    <section id="features" className="px-5 py-[100px] sm:px-[48px]" style={{ background: "#0C0F18" }}>
      <div className="mx-auto max-w-[1240px]">
        <Reveal>
          <h2 className="mb-[12px] text-center text-[32px] font-[800] leading-[1.1] tracking-[-1px] text-[#F1F5F9] sm:text-[48px] sm:tracking-[-2px]">
            The complete content rescue system.
          </h2>
        </Reveal>
        <Reveal>
          <p className="mb-[48px] text-center text-[16px] text-[#64748B]">No other tool does all 5 steps.</p>
        </Reveal>

        {/* 5-col grid desktop, 2-col tablet, 1-col mobile */}
        <div className="mb-[40px] grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step) => (
            <Reveal key={step.num}>
              <div
                className={`rounded-[14px] bg-[#0F1219] p-[28px_18px] text-center transition-all duration-300 hover:-translate-y-[3px] ${
                  step.ai
                    ? "border border-[rgba(249,115,22,0.2)] hover:border-[#F97316]"
                    : "border border-[#1E293B] hover:border-[#3B82F6]"
                }`}
              >
                <div
                  className={`mx-auto mb-[16px] flex h-[38px] w-[38px] items-center justify-center rounded-full text-[16px] font-bold text-white ${
                    step.ai ? "bg-[#F97316]" : "bg-[#3B82F6]"
                  }`}
                >
                  {step.num}
                </div>
                <h3 className="mb-[10px] text-[14px] font-bold tracking-[0.5px] text-[#F1F5F9]">{step.title}</h3>
                <p className="text-[12px] leading-[1.5] text-[#94A3B8]">{step.desc}</p>
                <span className={`mt-[14px] inline-block rounded-[5px] px-[10px] py-[4px] text-[10px] font-semibold ${step.tagStyle}`}>
                  {step.tag}
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="#waitlist"
            className="inline-flex items-center gap-[8px] rounded-[8px] bg-[#3B82F6] px-[32px] py-[14px] font-sans text-[16px] font-semibold text-white no-underline transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#2563EB] hover:shadow-[0_8px_40px_rgba(59,130,246,0.15)]"
          >
            Join the Waitlist →
          </a>
        </div>
      </div>
    </section>
  );
}
