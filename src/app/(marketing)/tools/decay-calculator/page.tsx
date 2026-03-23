import { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import DecayCalculator from "@/components/marketing/tools/DecayCalculator";
import { Calculator } from "lucide-react";

export const metadata: Metadata = {
  title: "Content Decay Calculator - How Much Traffic Are You Losing? | SerpVive",
  description:
    "Free calculator: estimate how much revenue you're losing to content decay every month. Enter your traffic and CPC to see the impact.",
  alternates: {
    canonical: "https://serpvive.com/tools/decay-calculator",
  },
  openGraph: {
    title: "Content Decay Calculator - How Much Are You Losing?",
    description:
      "Free tool to estimate monthly revenue lost to content decay. Enter your traffic and CPC.",
    url: "https://serpvive.com/tools/decay-calculator",
    type: "website",
  },
};

export default function DecayCalculatorPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-36 pb-10 sm:pt-40 sm:pb-14 px-5 sm:px-12 text-center"
        style={{ background: "#07090F" }}
      >
        <div className="mx-auto" style={{ maxWidth: "720px" }}>
          <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#F59E0B] bg-[#F59E0B]/10 px-4 py-1.5 rounded-full mb-6">
            <Calculator size={14} strokeWidth={1.5} />
            Free Tool
          </div>
          <h1
            className="font-extrabold text-[#F1F5F9] tracking-tight mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
          >
            Content Decay Calculator
          </h1>
          <p
            className="text-[#94A3B8] mx-auto leading-relaxed"
            style={{
              fontSize: "clamp(15px, 1.2vw, 18px)",
              maxWidth: "540px",
            }}
          >
            Estimate how much potential revenue you lose every month from
            content that&apos;s silently losing rankings.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section
        className="pb-20 sm:pb-28 px-5 sm:px-12"
        style={{ background: "#07090F" }}
      >
        <DecayCalculator />
      </section>

      <Footer />
    </>
  );
}
