import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import HeroSection from "@/components/marketing/HeroSection";
import SocialProof from "@/components/marketing/SocialProof";
import ProblemSection from "@/components/marketing/ProblemSection";
import WhatWeDoSection from "@/components/marketing/WhatWeDoSection";
import ComparisonSection from "@/components/marketing/ComparisonSection";
import StepsSection from "@/components/marketing/StepsSection";
import AIDiagnosisSection from "@/components/marketing/AIDiagnosisSection";
import ExampleSection from "@/components/marketing/ExampleSection";
import PersonasSection from "@/components/marketing/PersonasSection";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import PricingSection from "@/components/marketing/PricingSection";
import FinalCTA from "@/components/marketing/FinalCTA";
import Footer from "@/components/marketing/Footer";
import RevealObserver from "@/components/marketing/RevealObserver";

export const metadata: Metadata = {
  title: "SerpVive — Your Blog Is Losing Traffic. We Tell You Why.",
  description:
    "SerpVive finds the dying posts, explains why, and tells you exactly what to fix. AI-powered content decay monitor with actionable refresh briefs.",
  openGraph: {
    title: "SerpVive — Your Blog Is Losing Traffic. We Tell You Why.",
    description:
      "SerpVive finds the dying posts, explains why, and tells you exactly what to fix.",
    url: "https://serpvive.com",
    siteName: "SerpVive",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SerpVive — Your Blog Is Losing Traffic",
    description:
      "SerpVive finds the dying posts, explains why, and tells you exactly what to fix.",
    creator: "@serpvive",
  },
};

export default function MarketingPage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <SocialProof />
      <ProblemSection />
      <WhatWeDoSection />
      <ComparisonSection />
      <StepsSection />
      <AIDiagnosisSection />
      <ExampleSection />
      <PersonasSection />
      <FeaturesGrid />
      <PricingSection />
      <FinalCTA />
      <Footer />
      <RevealObserver />
    </>
  );
}
