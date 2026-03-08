const STAR_PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

const AVATARS = [
  { initials: "JD", color: "blue" },
  { initials: "MK", color: "orange" },
  { initials: "RS", color: "green" },
  { initials: "AL", color: "purple" },
  { initials: "TC", color: "red" },
] as const;

const AVATAR_COLORS: Record<string, string> = {
  blue: "bg-[rgba(59,130,246,0.15)] text-[#3B82F6]",
  orange: "bg-[rgba(249,115,22,0.15)] text-[#F97316]",
  green: "bg-[rgba(34,197,94,0.15)] text-[#22C55E]",
  purple: "bg-[rgba(139,92,246,0.15)] text-[#8B5CF6]",
  red: "bg-[rgba(239,68,68,0.15)] text-[#EF4444]",
};

const LABELS = ["SEO Agencies", "Content Teams", "SaaS Blogs", "Publishers", "Freelancers"];

export default function SocialProof() {
  return (
    <section
      className="relative overflow-hidden px-5 py-[48px] text-center sm:px-[48px]"
      style={{ background: "#07090F", borderTop: "1px solid rgba(30,41,59,0.2)" }}
    >
      <div className="mx-auto max-w-[900px]">
        {/* Stars + text */}
        <div className="mb-[12px] flex items-center justify-center gap-[16px]">
          <div className="flex gap-[2px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} viewBox="0 0 24 24" className="h-[20px] w-[20px] fill-[#FBBF24]">
                <path d={STAR_PATH} />
              </svg>
            ))}
          </div>
          <span className="text-[14px] text-[#94A3B8]">
            Built for <strong className="text-[#F1F5F9]">SEO professionals</strong> who protect the traffic they&apos;ve already earned
          </span>
        </div>

        {/* Avatars */}
        <div className="mt-[16px] flex items-center justify-center gap-[32px]">
          <div className="flex">
            {AVATARS.map((a, i) => (
              <div
                key={a.initials}
                className={`flex h-[36px] w-[36px] items-center justify-center rounded-full border-2 border-[#07090F] text-[12px] font-[700] ${AVATAR_COLORS[a.color]} ${i > 0 ? "ml-[-10px]" : ""}`}
              >
                {a.initials}
              </div>
            ))}
          </div>
          <span className="text-[14px] text-[#64748B]">
            Join <strong className="text-[#94A3B8]">early adopters</strong> on the waitlist
          </span>
        </div>

        {/* Logo wall */}
        <div className="mt-[24px] flex flex-wrap justify-center gap-5 opacity-[0.35] sm:gap-[40px]">
          {LABELS.map((label) => (
            <span key={label} className="text-[12px] font-[700] uppercase tracking-[1px] text-[#94A3B8] sm:text-[15px]">
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
