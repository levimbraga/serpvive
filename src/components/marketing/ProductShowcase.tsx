import { Reveal } from "@/hooks/useReveal";

const PAGES = [
  { url: "/best-crm-software-2024", clicks: "167", delta: "-47%", status: "c" as const, severity: "r" as const, diagnose: true },
  { url: "/remote-work-tools-guide", clicks: "284", delta: "-32%", status: "c" as const, severity: "r" as const, diagnose: true },
  { url: "/project-management-tips", clicks: "198", delta: "-28%", status: "c" as const, severity: "r" as const, diagnose: true },
  { url: "/email-marketing-tips", clicks: "512", delta: "-18%", status: "w" as const, severity: "a" as const, diagnose: false },
  { url: "/content-strategy-2025", clicks: "345", delta: "-12%", status: "w" as const, severity: "a" as const, diagnose: false },
  { url: "/saas-pricing-strategies", clicks: "891", delta: "-3%", status: "h" as const, severity: "g" as const, diagnose: false },
];

const DOT_COLORS = { c: "bg-[#EF4444]", w: "bg-[#F59E0B]", h: "bg-[#22C55E]" };
const SEVERITY_STYLES = {
  r: "text-[#EF4444] bg-[rgba(239,68,68,0.1)]",
  a: "text-[#F59E0B] bg-[rgba(245,158,11,0.1)]",
  g: "text-[#22C55E] bg-[rgba(34,197,94,0.06)]",
};

export default function ProductShowcase() {
  return (
    <section className="relative px-5 pb-[100px] text-center sm:px-[48px]" style={{ background: "#07090F" }}>
      <div className="mx-auto max-w-[1000px]">
        <Reveal>
          <div className="mb-[24px] text-[13px] font-[600] uppercase tracking-[2px] text-[#64748B]">
            What your dashboard looks like
          </div>
        </Reveal>

        <Reveal>
          <div
            className="overflow-hidden rounded-[16px] text-left"
            style={{
              background: "#0F1219",
              border: "1px solid #1E293B",
              boxShadow: "0 40px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset",
            }}
          >
            {/* Browser bar */}
            <div className="flex items-center gap-[8px] border-b border-[#1E293B] px-[20px] py-[14px]" style={{ background: "rgba(7,9,15,0.5)" }}>
              <div className="h-[9px] w-[9px] rounded-full bg-[#EF4444] opacity-50" />
              <div className="h-[9px] w-[9px] rounded-full bg-[#F59E0B] opacity-50" />
              <div className="h-[9px] w-[9px] rounded-full bg-[#22C55E] opacity-50" />
              <span className="flex-1 text-center font-[family-name:var(--font-mono)] text-[12px] text-[#475569]">
                serpvive.com/dashboard
              </span>
            </div>

            {/* Content: 2-col on desktop, 1-col on mobile */}
            <div className="grid grid-cols-1 gap-[28px] p-[32px] lg:grid-cols-[260px_1fr]">
              {/* Left: Health Score (hidden on mobile) */}
              <div className="hidden flex-col items-center rounded-[12px] border border-[rgba(30,41,59,0.4)] p-[24px] sm:flex" style={{ background: "rgba(7,9,15,0.4)" }}>
                {/* Ring */}
                <div className="relative mb-[12px] h-[120px] w-[120px]">
                  <svg viewBox="0 0 100 100" className="h-[120px] w-[120px] -rotate-90">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#1E293B" strokeWidth="6" />
                    <circle
                      cx="50" cy="50" r="44" fill="none" stroke="#3B82F6" strokeWidth="6"
                      strokeLinecap="round" strokeDasharray="302" strokeDashoffset="85"
                    />
                  </svg>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="block text-[36px] font-[800] leading-none text-white">72</span>
                    <span className="text-[11px] text-[#64748B]">/ 100</span>
                  </div>
                </div>
                <div className="mb-[4px] text-[11px] font-[600] uppercase tracking-[1.5px] text-[#64748B]">Health Score</div>
                <div className="mb-[10px] text-[13px] text-[#94A3B8]">
                  <span className="font-[600] text-[#EF4444]">-5</span> from last week
                </div>
                <div className="flex gap-[6px]">
                  <span className="rounded-[5px] bg-[rgba(34,197,94,0.1)] px-[9px] py-[3px] text-[10px] font-[600] text-[#22C55E]">12 Healthy</span>
                  <span className="rounded-[5px] bg-[rgba(245,158,11,0.1)] px-[9px] py-[3px] text-[10px] font-[600] text-[#F59E0B]">6 Warning</span>
                  <span className="rounded-[5px] bg-[rgba(239,68,68,0.1)] px-[9px] py-[3px] text-[10px] font-[600] text-[#EF4444]">4 Critical</span>
                </div>
              </div>

              {/* Right: Page list */}
              <div className="flex flex-col gap-[6px]">
                <div className="mb-[8px] flex items-center justify-between">
                  <h3 className="text-[14px] font-[700] text-[#F1F5F9]">Decaying Pages</h3>
                  <span className="rounded-[5px] bg-[rgba(239,68,68,0.1)] px-[10px] py-[3px] text-[11px] font-[600] text-[#EF4444]">
                    4 need attention
                  </span>
                </div>

                {PAGES.map((page) => (
                  <div
                    key={page.url}
                    className="flex items-center rounded-[8px] border border-transparent px-[14px] py-[12px] transition-all duration-150 hover:border-[#1E293B]"
                    style={{ background: "rgba(7,9,15,0.5)" }}
                  >
                    <div className={`mr-[12px] h-[7px] w-[7px] shrink-0 rounded-full ${DOT_COLORS[page.status]}`} />
                    <span className="flex-1 font-[family-name:var(--font-mono)] text-[12px] text-[#94A3B8]">{page.url}</span>
                    <span className="mr-[12px] font-[family-name:var(--font-mono)] text-[12px] text-[#64748B]">{page.clicks}</span>
                    <span className={`rounded-[4px] px-[7px] py-[2px] font-[family-name:var(--font-mono)] text-[11px] font-[700] ${SEVERITY_STYLES[page.severity]}`}>
                      {page.delta}
                    </span>
                    {page.diagnose && (
                      <span className="ml-[10px] cursor-pointer whitespace-nowrap rounded-[5px] bg-[#F97316] px-[12px] py-[4px] text-[10px] font-[600] text-white transition-all duration-150 hover:bg-[#EA580C]">
                        Diagnose
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
