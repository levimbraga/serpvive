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
  title: "SerpVive | Your Blog Is Losing Traffic. We Tell You Why.",
  description:
    "SerpVive monitors your blog, detects posts losing traffic, and tells you exactly what to fix to recover rankings. Free plan available. Powered by Claude Opus 4.6.",
  keywords: ["content decay", "SEO monitoring", "blog traffic", "content refresh", "SEO tool", "SerpVive"],
  alternates: {
    canonical: "https://serpvive.com",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "SerpVive | Your Blog Is Losing Traffic. We Tell You Why.",
    description:
      "SerpVive monitors your blog, detects posts losing traffic, and tells you exactly what to fix to recover rankings.",
    url: "https://serpvive.com",
    siteName: "SerpVive",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SerpVive | Your Blog Is Losing Traffic",
    description:
      "SerpVive monitors your blog, detects posts losing traffic, and tells you exactly what to fix to recover rankings.",
    creator: "@levimbraga",
  },
};

// Static JSON-LD for Google rich results (hardcoded, no user input)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SerpVive",
  applicationCategory: "SEO Tool",
  operatingSystem: "Web",
  description:
    "Content decay monitoring tool that detects posts losing traffic, diagnoses why with AI, and tells you exactly what to fix.",
  url: "https://serpvive.com",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "0",
    highPrice: "129",
    offerCount: "4",
  },
};

export default function MarketingPage() {
  return (
    <>
      {/* Safe: jsonLd is a hardcoded constant, not user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
