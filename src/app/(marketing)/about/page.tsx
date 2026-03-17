import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "About — SerpVive",
  description: "The story behind SerpVive — built by a solo founder tired of losing traffic with no tool to explain why.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Dark hero */}
      <section
        className="pt-[140px] sm:pt-[160px] pb-16 sm:pb-20 px-5 sm:px-12 text-center"
        style={{ background: "#07090F" }}
      >
        <h1
          className="text-[32px] sm:text-[44px] font-extrabold text-white mb-4"
          style={{ letterSpacing: "-0.04em" }}
        >
          About SerpVive
        </h1>
        <p className="text-[16px] sm:text-[18px] text-[#94A3B8] max-w-[600px] mx-auto leading-relaxed">
          Built by a solo founder tired of losing traffic with no tool to explain why.
        </p>
      </section>

      {/* Content */}
      <section className="bg-white px-5 sm:px-12 py-16 sm:py-20">
        <div className="max-w-[680px] mx-auto">
          {/* The problem */}
          <p className="text-[16px] text-[#374151] leading-[1.8] mb-6">
            Every SEO tool tells you a post is declining. None tell you <strong className="text-[#111827]">what changed</strong>,{" "}
            <strong className="text-[#111827]">what competitors added</strong>, or{" "}
            <strong className="text-[#111827]">what to fix</strong>.
          </p>

          <p className="text-[16px] text-[#374151] leading-[1.8] mb-6">
            I built SerpVive because I was spending hours every week checking Google Analytics,
            comparing my posts with competitors in new tabs, and trying to figure out why my traffic
            was dropping. The data was there — scattered across five different tools and ten browser tabs.
          </p>

          <p className="text-[16px] text-[#374151] leading-[1.8] mb-6">
            SerpVive does what I was doing manually, but in 2 minutes instead of 2 hours: it monitors
            every page, detects when traffic drops, reads the competitors that are beating you, and
            delivers a specific action plan — with evidence, not guesswork.
          </p>

          {/* Tech stack */}
          <div
            className="rounded-xl border border-[#E2E8F0] p-6 sm:p-8 my-10"
            style={{ background: "#F9FAFB" }}
          >
            <h2 className="text-[16px] font-bold text-[#111827] mb-4 uppercase tracking-wider">
              How it&apos;s built
            </h2>
            <div className="space-y-2.5">
              {[
                { label: "AI", value: "Anthropic Claude Opus 4.6" },
                { label: "Framework", value: "Next.js + TypeScript" },
                { label: "Database", value: "Supabase (PostgreSQL)" },
                { label: "Hosting", value: "Vercel" },
                { label: "Payments", value: "Stripe" },
                { label: "Email", value: "Resend" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[13px] text-[#6B7280] w-24 flex-shrink-0">{item.label}</span>
                  <span className="text-[14px] text-[#111827] font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-[16px] text-[#374151] leading-[1.8] mb-6">
              SerpVive is a one-person company. Every feature, every line of code, every support email —
              it&apos;s all me. That means the product moves fast, and your feedback shapes what gets built next.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 rounded-xl bg-[#3B82F6] text-white text-[16px] font-semibold no-underline transition-all duration-200 hover:bg-[#2563EB] hover:shadow-[0_8px_50px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 px-8 py-3.5"
            >
              Get Started Free
              <span className="text-[18px]">&rarr;</span>
            </Link>
            <p className="text-[14px] text-[#6B7280] mt-4">
              Questions? Reach me at{" "}
              <a href="mailto:serpvive@gmail.com" className="text-[#3B82F6] hover:underline">
                serpvive@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
