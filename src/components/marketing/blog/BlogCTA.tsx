import Link from "next/link";
import { ArrowRight } from "lucide-react";

type BlogCTAProps = {
  heading?: string;
  description?: string;
  buttonText?: string;
  href?: string;
};

export default function BlogCTA({
  heading = "Stop losing traffic you already earned",
  description = "SerpVive monitors your content 24/7 and tells you exactly what to fix, powered by AI.",
  buttonText = "Get Started Free",
  href = "/signup",
}: BlogCTAProps) {
  return (
    <div className="my-10 rounded-2xl border border-[#3B82F6]/20 bg-gradient-to-br from-[#3B82F6]/5 to-[#7C3AED]/5 p-8 sm:p-10 text-center">
      <h3 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] mb-3">
        {heading}
      </h3>
      <p className="text-[15px] text-[#94A3B8] mb-6 max-w-md mx-auto">
        {description}
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] text-white font-semibold px-6 py-3 text-[15px] no-underline hover:bg-[#2563EB] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
      >
        {buttonText}
        <ArrowRight size={16} strokeWidth={1.5} />
      </Link>
    </div>
  );
}
