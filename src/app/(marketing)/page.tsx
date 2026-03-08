import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import HeroSection from "@/components/marketing/HeroSection";
import SocialProofBar from "@/components/marketing/SocialProofBar";
import ProblemSection from "@/components/marketing/ProblemSection";
import StepsSection from "@/components/marketing/StepsSection";
import ExampleSection from "@/components/marketing/ExampleSection";
import PricingSection from "@/components/marketing/PricingSection";
import FinalCTA from "@/components/marketing/FinalCTA";
import Footer from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "SerpVive — Revive Your Rankings",
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
        <SocialProofBar />
        <ProblemSection />
        <StepsSection />
        <ExampleSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
