import { Reveal } from "@/hooks/useReveal";

const AUDIENCES = ["SEO Agencies", "Content Teams", "SaaS Blogs", "Publishers", "Freelancers"];

export default function SocialProofBar() {
  return (
    <section
      className="px-5 py-[56px] sm:px-[48px]"
      style={{
        background: "#0C0F18",
        borderTop: "1px solid rgba(30,41,59,0.3)",
        borderBottom: "1px solid rgba(30,41,59,0.3)",
      }}
    >
      <div className="mx-auto max-w-[1240px] text-center">
        <p className="mb-[28px] text-[15px] text-[#64748B]">
          Built for <strong className="text-[#94A3B8]">SEO professionals</strong> who protect the traffic they&apos;ve already earned.
        </p>
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-40 sm:gap-[48px]">
            {AUDIENCES.map((name) => (
              <span key={name} className="text-[14px] font-bold uppercase tracking-[1px] text-[#94A3B8] sm:text-[18px]">
                {name}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
