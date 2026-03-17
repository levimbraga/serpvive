const STAR_PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

const AVATARS = [
  { initials: "JD", bg: "bg-[#3B82F6]" },
  { initials: "MK", bg: "bg-[#F97316]" },
  { initials: "RS", bg: "bg-[#22C55E]" },
  { initials: "AL", bg: "bg-[#7C3AED]" },
  { initials: "TC", bg: "bg-[#EF4444]" },
];

const CATEGORIES = [
  "SEO Agencies",
  "Content Teams",
  "SaaS Blogs",
  "Publishers",
  "Freelancers",
];

export default function SocialProof() {
  return (
    <section className="py-12 sm:py-16 px-5 sm:px-12">
      <div className="max-w-[800px] mx-auto flex flex-col items-center gap-8">
        {/* Stars + text */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-[#F59E0B]">
                <path d={STAR_PATH} />
              </svg>
            ))}
          </div>
          <span className="text-[14px] text-[#94A3B8]">
            Built for <strong className="text-[#F1F5F9] font-semibold">SEO professionals</strong> who protect the traffic they&apos;ve already earned
          </span>
        </div>

        {/* Avatar stack + text */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex -space-x-2.5">
            {AVATARS.map((a) => (
              <div
                key={a.initials}
                className={`w-9 h-9 rounded-full ${a.bg} flex items-center justify-center text-[11px] font-bold text-white border-2 border-[#07090F]`}
              >
                {a.initials}
              </div>
            ))}
          </div>
          <span className="text-[14px] text-[#94A3B8]">
            Join <strong className="text-[#F1F5F9] font-semibold">early adopters</strong> already monitoring their content
          </span>
        </div>

        {/* Category labels */}
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-2">
          {CATEGORIES.map((cat, i) => (
            <span key={cat} className="flex items-center gap-2 text-[13px] text-[#64748B] font-medium uppercase tracking-wide">
              {cat}
              {i < CATEGORIES.length - 1 && (
                <span className="text-[#1E293B]">·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
