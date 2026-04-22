import { ArrowRight } from "lucide-react";
import WaitlistCTA from "../WaitlistCTA";

type BlogCTAProps = {
  heading?: string;
  description?: string;
  buttonText?: string;
};

export default function BlogCTA({
  heading = "Stop losing traffic you already earned",
  description = "SerpVive monitors your content 24/7 and tells you exactly what to fix, powered by AI. Launching H2 2026 — join the waitlist for priority access.",
  buttonText = "Join the waitlist",
}: BlogCTAProps) {
  return (
    <div className="my-10 rounded-2xl border border-[#2563EB]/20 bg-[#EFF6FF] p-8 sm:p-10 text-center">
      <h3 className="text-xl sm:text-2xl font-bold text-[#111827] mb-3">
        {heading}
      </h3>
      <p className="text-[15px] text-[#4B5563] mb-6 max-w-md mx-auto">
        {description}
      </p>
      <WaitlistCTA
        source="blog_cta"
        className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] !text-white font-semibold px-6 py-3 text-[15px] hover:bg-[#1D4ED8] transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] cursor-pointer"
      >
        {buttonText}
        <ArrowRight size={16} strokeWidth={1.5} />
      </WaitlistCTA>
    </div>
  );
}
