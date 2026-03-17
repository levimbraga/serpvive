import { Reveal } from "@/hooks/useReveal";
import { Users, Building2, PenTool } from "lucide-react";

const PERSONAS = [
  {
    icon: Users,
    title: "SEO Freelancers & Agencies",
    body: "Managing 3\u201310 client blogs? Stop spending 4\u20136 hours per week on manual audits with spreadsheets. SerpVive monitors everything. The AI diagnosis impresses your clients.",
    plan: "Agency plan \u00B7 $129/mo",
  },
  {
    icon: Building2,
    title: "Content Marketers In-House",
    body: "Responsible for a company blog with 50\u2013500+ posts? Health Score + ROI data = ammunition to ask your boss for budget.",
    plan: "Pro plan \u00B7 $69/mo",
  },
  {
    icon: PenTool,
    title: "Bloggers & Publishers",
    body: "Your blog is your business. Every lost click = lost money. One recovered post pays for the entire month.",
    plan: "Starter plan \u00B7 $29/mo",
  },
];

export default function PersonasSection() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-12 bg-white">
      <div className="max-w-[960px] mx-auto">
        <Reveal>
          <h2
            className="text-[32px] sm:text-[44px] lg:text-[52px] font-extrabold leading-[1.1] text-center text-[#0F172A] mb-4"
            style={{ letterSpacing: "-0.04em" }}
          >
            Built for people who take content seriously
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[16px] sm:text-[18px] text-[#64748B] leading-relaxed text-center max-w-[560px] mx-auto mb-14">
            Whether you manage 1 blog or 10, SerpVive saves you hours every week.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERSONAS.map((persona) => {
            const Icon = persona.icon;
            return (
              <Reveal key={persona.title}>
                <div className="rounded-xl border border-[#E2E8F0] bg-white p-7 sm:p-9 transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] h-full flex flex-col">
                  <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-[#3B82F6]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#0F172A] mb-3">
                    {persona.title}
                  </h3>
                  <p className="text-[15px] text-[#334155] leading-relaxed flex-1">
                    {persona.body}
                  </p>
                  <div className="mt-5 pt-4 border-t border-[#F1F5F9]">
                    <span className="text-[12px] font-bold uppercase tracking-wider text-[#3B82F6] bg-[#EFF6FF] px-3 py-1.5 rounded-full">
                      {persona.plan}
                    </span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
