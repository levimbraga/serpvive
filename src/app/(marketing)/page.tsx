import type { Metadata } from "next";
import Navbar from "@/components/marketing/navbar";
import HeroSection from "@/components/marketing/hero-section";
import ProblemSection from "@/components/marketing/problem-section";
import HowItWorksSection from "@/components/marketing/how-it-works-section";
import DiagnosisExampleSection from "@/components/marketing/diagnosis-example-section";
import PricingSection from "@/components/marketing/pricing-section";
import FinalCTASection from "@/components/marketing/final-cta-section";
import Footer from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "SerpVive — AI Content Decay Monitor | Revive Your Rankings",
  description:
    "Detect posts losing traffic, diagnose WHY with AI, and get actionable refresh briefs with micro-drafts. The complete content rescue system.",
  openGraph: {
    title: "SerpVive — Revive Your Rankings",
    description:
      "AI-powered content decay monitor. Detect, diagnose, and recover your dying content.",
    url: "https://serpvive.com",
    siteName: "SerpVive",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SerpVive — Revive Your Rankings",
    description:
      "AI-powered content decay monitor. Detect, diagnose, and recover your dying content.",
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <DiagnosisExampleSection />
        <PricingSection />
        <FinalCTASection />
      </main>
      <Footer />
    </>
  );
}
