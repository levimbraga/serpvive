import { Reveal } from "@/hooks/useReveal";

const STATS = [
  { num: "90.63%", color: "text-[#EF4444]", desc: "of published content gets ZERO traffic from Google", src: "Source: Ahrefs" },
  { num: "-20%", color: "text-[#F97316]", desc: "organic traffic lost per year when content is neglected", src: "Source: Conductor" },
  { num: "-25%", color: "text-[#EF4444]", desc: "drop in search volume predicted by 2026 due to AI Search", src: "Source: Gartner" },
];

export default function ProblemSection() {
  return (
    <section className="px-5 py-[100px] sm:px-[48px]" style={{ background: "#07090F" }}>
      <div className="mx-auto max-w-[1240px]">
        <Reveal>
          <h2 className="mb-[12px] text-center text-[32px] font-[800] leading-[1.1] tracking-[-1px] text-[#F1F5F9] sm:text-[48px] sm:tracking-[-2px]">
            Your blog is losing traffic right now.
            <br />
            <span className="text-[#475569]">You just don&apos;t know it yet.</span>
          </h2>
        </Reveal>
        <Reveal>
          <p className="mb-[48px] text-center text-[16px] text-[#64748B]">
            The numbers don&apos;t lie — and they&apos;re getting worse with AI Search.
          </p>
        </Reveal>

        {/* Stats grid — 3 cols desktop, 1 col mobile */}
        <div className="mb-[40px] grid grid-cols-1 gap-[20px] lg:grid-cols-3">
          {STATS.map((stat) => (
            <Reveal key={stat.num}>
              <div className="rounded-[14px] border border-[#1E293B] bg-[#0F1219] p-[36px] text-center transition-all duration-300 hover:-translate-y-[3px] hover:border-[#3B82F6] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
                <div className={`mb-[8px] text-[56px] font-[800] leading-none tracking-[-2px] ${stat.color}`}>{stat.num}</div>
                <div className="text-[14px] leading-[1.5] text-[#94A3B8]">{stat.desc}</div>
                <div className="mt-[12px] text-[11px] text-[#475569]">{stat.src}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Alert box */}
        <Reveal>
          <div
            className="rounded-[12px] p-[24px_32px] text-center text-[15px] leading-[1.7] text-[#94A3B8]"
            style={{
              background: "rgba(249,115,22,0.12)",
              border: "1px solid rgba(249,115,22,0.15)",
            }}
          >
            <strong className="text-[#F97316]">AI Search is accelerating content decay.</strong>{" "}
            ChatGPT cites content that&apos;s 25.7% fresher than traditional Google results. If you&apos;re not updating, you&apos;re disappearing.
          </div>
        </Reveal>
      </div>
    </section>
  );
}
