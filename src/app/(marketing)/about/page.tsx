import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import {
  ArrowRight,
  Shield,
  FileText,
  BarChart3,
  Heart,
  Brain,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About SerpVive — Protecting Your Blog Traffic",
  description:
    "SerpVive monitors your blog, detects content decay, and tells you exactly what to fix. Learn about our mission and approach.",
  alternates: { canonical: "https://serpvive.com/about" },
  robots: { index: true, follow: true },
};

const PRINCIPLES = [
  {
    icon: BarChart3,
    title: "Evidence over opinions",
    description:
      "Every diagnosis cites specific data from the SERP and competitors. No guesswork, no generic advice.",
  },
  {
    icon: FileText,
    title: "Actions over reports",
    description:
      "Refresh briefs include ready-to-use suggestions and micro-drafts. Not dashboards you stare at.",
  },
  {
    icon: Shield,
    title: "Proof over promises",
    description:
      "Automatic before/after measurement shows if your refresh actually worked. Results, not hope.",
  },
  {
    icon: Heart,
    title: "Fairness over lock-in",
    description:
      "Free plan available. Cancel anytime. No contracts. No hidden fees. Your data is yours.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Dark hero */}
      <header
        className="pt-36 pb-12 sm:pt-40 sm:pb-16 px-5 sm:px-12 text-center"
        style={{ background: "#07090F" }}
      >
        <div className="mx-auto" style={{ maxWidth: "720px" }}>
          <h1
            className="font-extrabold text-[#F1F5F9] tracking-tight mb-5"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
          >
            We protect the traffic you already earned.
          </h1>
          <p
            className="text-[#94A3B8] mx-auto leading-relaxed"
            style={{ fontSize: "clamp(15px, 1.2vw, 18px)", maxWidth: "540px" }}
          >
            SerpVive was built for one reason: too much valuable content dies
            silently, and nobody notices until it&apos;s too late.
          </p>
        </div>
      </header>

      {/* Content (Light) */}
      <section className="bg-white px-5 sm:px-12 pt-12 sm:pt-16 pb-20 sm:pb-28">
        <div className="mx-auto" style={{ maxWidth: "720px" }}>
          {/* What we do */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-4">
            What we do
          </h2>
          <p className="text-[15px] text-[#374151] leading-relaxed mb-4">
            SerpVive monitors your blog every day, detects posts that are losing
            traffic, uses AI to diagnose exactly why with evidence from the live
            SERP, and tells you what to update. Then we measure if your fix
            worked.
          </p>
          <p className="text-[15px] text-[#374151] leading-relaxed mb-12">
            The complete content rescue loop: detect, diagnose, fix, prove.
          </p>

          {/* Why we built this */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-4">
            Why we built this
          </h2>
          <p className="text-[15px] text-[#374151] leading-relaxed mb-4">
            Content decay affects every blog. Studies show that{" "}
            <strong className="text-[#111827]">90% of published content gets zero traffic from Google</strong>.
            The average blog post starts losing rankings after 6-12 months. And
            with AI Search accelerating freshness requirements, the problem is
            only getting worse.
          </p>
          <p className="text-[15px] text-[#374151] leading-relaxed mb-12">
            Existing tools show you the data but don&apos;t explain why your
            content is declining or what specifically to fix. We wanted a tool
            that goes beyond dashboards and actually helps you take action.
          </p>

          {/* Our approach */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-6">
            Our approach
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-5"
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                    <p.icon size={16} strokeWidth={1.5} className="text-[#2563EB]" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#111827]">
                    {p.title}
                  </h3>
                </div>
                <p className="text-[14px] text-[#4B5563] leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>

          {/* Powered by AI */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-4">
            Powered by advanced AI
          </h2>
          <div className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 mb-12">
            <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] flex items-center justify-center shrink-0">
              <Brain size={16} strokeWidth={1.5} className="text-[#7C3AED]" />
            </div>
            <p className="text-[14px] text-[#374151] leading-relaxed">
              Our diagnosis engine uses Claude Opus to read the live
              SERP, analyze competitor content, and compare it against yours.
              The result is a diagnosis that reads like it came from a senior
              SEO consultant, not a generic AI chatbot.
            </p>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-[#2563EB]/15 bg-[#EFF6FF] p-8 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-3">
              See it in action
            </h2>
            <p className="text-[15px] text-[#4B5563] mb-6 max-w-md mx-auto">
              Connect your Google Search Console, see your Health Score, and get
              your first AI diagnosis in minutes.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] text-white font-semibold px-6 py-3 text-[15px] no-underline hover:bg-[#1D4ED8] transition-all"
            >
              Get Started Free
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
