import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import HeroSection from "@/components/marketing/HeroSection";
import SocialProof from "@/components/marketing/SocialProof";
import ProductShowcase from "@/components/marketing/ProductShowcase";
import ProblemSection from "@/components/marketing/ProblemSection";
import StepsSection from "@/components/marketing/StepsSection";
import ExampleSection from "@/components/marketing/ExampleSection";
import PricingSection from "@/components/marketing/PricingSection";
import FinalCTA from "@/components/marketing/FinalCTA";
import Footer from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "SerpVive — Revive Your Rankings | AI Content Decay Monitor",
  description:
    "AI-powered content decay monitor that detects posts losing traffic, diagnoses WHY with evidence, tells you exactly WHAT to fix, and proves it worked.",
  openGraph: {
    title: "SerpVive — Revive Your Rankings",
    description:
      "Detect posts losing traffic, diagnose why with AI, and get actionable refresh briefs with micro-drafts.",
    url: "https://serpvive.com",
    siteName: "SerpVive",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SerpVive — Revive Your Rankings",
    description:
      "AI-powered content decay monitor. Detect, diagnose, fix, prove.",
    creator: "@serpvive",
  },
};

export default function MarketingPage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <SocialProof />
      <ProductShowcase />
      <ProblemSection />
      <StepsSection />
      <ExampleSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </>
  );
}
