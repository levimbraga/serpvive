import { Reveal } from "@/hooks/useReveal";

const STEPS = [
  {
    num: 1,
    title: "CONNECT",
    desc: "Link your Google Search Console. 2 clicks. Read-only access.",
    tag: "FREE \u00B7 2 CLICKS",
    tagColor: "text-[#22C55E]",
    tagBg: "rgba(34,197,94,0.1)",
    tagBorder: "rgba(34,197,94,0.2)",
    accent: false,
  },
  {
    num: 2,
    title: "MONITOR",
    desc: "We track every page, every day. You get a Health Score.",
    tag: "AUTOMATIC",
    tagColor: "text-[#3B82F6]",
    tagBg: "rgba(59,130,246,0.1)",
    tagBorder: "rgba(59,130,246,0.2)",
    accent: false,
  },
  {
    num: 3,
    title: "DIAGNOSE",
    desc: "Click \u2018Diagnose\u2019 on any declining post. AI reads your competitors and explains WHY.",
    tag: "CLAUDE OPUS 4.6",
    tagColor: "text-[#7C3AED]",
    tagBg: "rgba(124,58,237,0.1)",
    tagBorder: "rgba(124,58,237,0.2)",
    accent: true,
  },
  {
    num: 4,
    title: "FIX",
    desc: "Follow the action plan with ready-to-use suggestions. Mark as updated.",
    tag: "MICRO-DRAFTS",
    tagColor: "text-[#F97316]",
    tagBg: "rgba(249,115,22,0.1)",
    tagBorder: "rgba(249,115,22,0.2)",
    accent: true,
  },
  {
    num: 5,
    title: "PROVE",
    desc: "28 days later: automatic before vs after. Did it work?",
    tag: "AUTOMATIC",
    tagColor: "text-[#22C55E]",
    tagBg: "rgba(34,197,94,0.1)",
    tagBorder: "rgba(34,197,94,0.2)",
    accent: false,
  },
];

export default function StepsSection() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-12" id="features">
      <div className="max-w-[1200px] mx-auto text-center">
        <Reveal>
          <h2
            className="font-extrabold leading-[1.1] mb-5"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 3.5rem)", letterSpacing: "-0.04em" }}
          >
            Five steps. Two minutes to set up.
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[16px] sm:text-[18px] text-[#94A3B8] leading-relaxed max-w-[560px] mx-auto mb-14">
            From &ldquo;my traffic is dropping&rdquo; to &ldquo;here&apos;s exactly what to fix&rdquo; — in one click.
          </p>
        </Reveal>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {STEPS.map((step) => (
            <Reveal key={step.num}>
              <div
                className={`rounded-xl p-6 sm:p-7 text-left border transition-all duration-300 hover:-translate-y-0.5 h-full ${
                  step.accent
                    ? "border-[rgba(124,58,237,0.3)] hover:border-[rgba(124,58,237,0.5)]"
                    : "border-[#1E293B] hover:border-[#334155]"
                }`}
                style={{ background: "#0F1219" }}
              >
                {/* Number */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold mb-5 ${
                    step.accent
                      ? "text-[#7C3AED]"
                      : "text-[#3B82F6]"
                  }`}
                  style={{
                    background: step.accent ? "rgba(124,58,237,0.12)" : "rgba(59,130,246,0.12)",
                    border: `1px solid ${step.accent ? "rgba(124,58,237,0.25)" : "rgba(59,130,246,0.25)"}`,
                  }}
                >
                  {step.num}
                </div>

                {/* Title */}
                <h3
                  className="text-[16px] font-bold text-[#F1F5F9] mb-2 tracking-wide"
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-[13px] text-[#94A3B8] leading-relaxed mb-4">
                  {step.desc}
                </p>

                {/* Tag */}
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${step.tagColor}`}
                  style={{
                    background: step.tagBg,
                    border: `1px solid ${step.tagBorder}`,
                  }}
                >
                  {step.tag}
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal>
          <div className="mt-12">
            <a
              href="/signup"
              className="inline-flex items-center gap-2.5 h-[52px] px-10 rounded-xl bg-[#3B82F6] text-white text-[16px] font-semibold no-underline transition-all duration-200 hover:bg-[#2563EB] hover:shadow-[0_8px_50px_rgba(59,130,246,0.15)] hover:-translate-y-0.5"
            >
              Get Started Free
              <span className="text-[18px]">&rarr;</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
