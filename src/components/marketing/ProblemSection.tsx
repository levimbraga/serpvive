import { Reveal } from "@/hooks/useReveal";

const STATS = [
  {
    value: "90.63%",
    color: "text-[#EF4444]",
    desc: "of published content gets ZERO traffic from Google",
    src: "Source: Ahrefs",
  },
  {
    value: "-20%",
    color: "text-[#F97316]",
    desc: "organic traffic lost per year when content is neglected",
    src: "Source: Conductor",
  },
  {
    value: "-25%",
    color: "text-[#EF4444]",
    desc: "drop in search volume predicted by 2026 due to AI Search",
    src: "Source: Gartner",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-12" style={{ background: "#0C0F18" }}>
      <div className="mx-auto text-center" style={{ maxWidth: "min(1600px, 90vw)" }}>
        <Reveal>
          <h2 className="font-extrabold leading-[1.1] mb-5" style={{ fontSize: "clamp(2rem, 4vw, 4rem)", letterSpacing: "-0.04em" }}>
            Your blog is losing traffic right now.
            <br />
            <span className="text-[#475569]">And AI Search is making it worse.</span>
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[16px] sm:text-[18px] text-[#94A3B8] leading-relaxed max-w-[600px] mx-auto mb-14">
            Content decay is the #1 silent threat to organic traffic. Here&apos;s the data:
          </p>
        </Reveal>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
          {STATS.map((stat) => (
            <Reveal key={stat.value}>
              <div
                className="rounded-xl p-7 sm:p-8 text-center border border-[#1E293B] transition-all duration-300 hover:border-[#334155] hover:-translate-y-0.5"
                style={{ background: "#0F1219" }}
              >
                <div className={`font-extrabold leading-none mb-3 ${stat.color}`} style={{ fontSize: "clamp(2.25rem, 5vw, 5rem)", letterSpacing: "-0.04em" }}>
                  {stat.value}
                </div>
                <p className="text-[14px] sm:text-[15px] text-[#94A3B8] leading-relaxed mb-3">
                  {stat.desc}
                </p>
                <p className="text-[11px] text-[#475569] uppercase tracking-wider font-medium">
                  {stat.src}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Alert box */}
        <Reveal>
          <div
            className="max-w-[700px] mx-auto rounded-xl p-6 sm:p-7 text-left border border-[rgba(249,115,22,0.25)]"
            style={{ background: "rgba(249,115,22,0.06)" }}
          >
            <p className="text-[14px] sm:text-[15px] leading-[1.7] text-[#F1F5F9]">
              <strong className="text-[#F97316]">AI Search is accelerating content decay.</strong>{" "}
              ChatGPT cites content that&apos;s 25.7% fresher than traditional Google results.
              If you&apos;re not updating, you&apos;re disappearing.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
