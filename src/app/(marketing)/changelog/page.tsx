import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { ArrowRight, History } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog — SerpVive",
  description:
    "See what's new in SerpVive. Updates, improvements, and fixes shipped every week.",
  alternates: { canonical: "https://serpvive.com/changelog" },
  robots: { index: true, follow: true },
};

type Category = "new" | "improved" | "fix" | "launch";

type ChangelogEntry = {
  category: Category;
  title: string;
  description: string;
};

type ChangelogDay = {
  date: string;
  entries: ChangelogEntry[];
};

type ChangelogMonth = {
  month: string;
  days: ChangelogDay[];
};

const BADGE_STYLES: Record<Category, { bg: string; text: string; label: string }> = {
  new:      { bg: "#EFF6FF", text: "#2563EB", label: "NEW" },
  improved: { bg: "#EFF6FF", text: "#2563EB", label: "IMPROVED" },
  fix:      { bg: "#FFFBEB", text: "#D97706", label: "FIX" },
  launch:   { bg: "#F5F3FF", text: "#7C3AED", label: "LAUNCH" },
};

const CHANGELOG: ChangelogMonth[] = [
  {
    month: "March 2026",
    days: [
      {
        date: "March 23, 2026",
        entries: [
          {
            category: "new",
            title: "Comparison pages",
            description:
              "See how SerpVive compares to Semrush, Surfer SEO, and Frase side by side. Honest feature and pricing breakdowns.",
          },
          {
            category: "new",
            title: "Blog with SEO guides",
            description:
              "In-depth guides on Google Search Console, content auditing, and content decay. Written for SEO professionals.",
          },
          {
            category: "improved",
            title: "AI diagnosis quality",
            description:
              "E-E-A-T analysis, sharper summaries, SEO expert vocabulary. Diagnoses now read like they come from a senior consultant.",
          },
          {
            category: "improved",
            title: "AI reliability",
            description:
              "Automatic fallback across multiple AI providers. If one is down, another takes over seamlessly.",
          },
        ],
      },
      {
        date: "March 22, 2026",
        entries: [
          {
            category: "new",
            title: "Redesigned landing page",
            description:
              'New hero with loss-framing: "Your blog is losing traffic right now." Pricing section with consultant-rate anchoring.',
          },
          {
            category: "new",
            title: "Accessibility status badges",
            description:
              "Status indicators now use color + icon + text so they work for everyone, including users with color vision deficiencies.",
          },
          {
            category: "new",
            title: "Cancel feedback email",
            description:
              "When you cancel, we send a short, plain-text email asking why. From a real person, to help us improve.",
          },
          {
            category: "fix",
            title: "Google login first attempt",
            description:
              "Fixed an issue where Google OAuth occasionally failed on the first login attempt.",
          },
        ],
      },
      {
        date: "March 2026",
        entries: [
          {
            category: "launch",
            title: "SerpVive is live",
            description:
              "AI-powered content decay monitoring. Detect declining posts, diagnose why with evidence, get specific fixes, and prove your refresh worked. Free plan available.",
          },
        ],
      },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <Navbar />

      {/* Dark hero */}
      <header
        className="pt-36 pb-12 sm:pt-40 sm:pb-16 px-5 sm:px-12 text-center"
        style={{ background: "#07090F" }}
      >
        <div className="mx-auto" style={{ maxWidth: "720px" }}>
          <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#3B82F6] bg-[#3B82F6]/10 px-4 py-1.5 rounded-full mb-6">
            <History size={14} strokeWidth={1.5} />
            Changelog
          </div>
          <h1
            className="font-extrabold text-[#F1F5F9] tracking-tight mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
          >
            What&apos;s new in SerpVive
          </h1>
          <p
            className="text-[#94A3B8] mx-auto"
            style={{ fontSize: "clamp(15px, 1.2vw, 18px)", maxWidth: "480px" }}
          >
            Updates, improvements, and fixes shipped every week.
          </p>
        </div>
      </header>

      {/* Entries (Light) */}
      <section className="bg-white px-5 sm:px-12 pt-12 sm:pt-16 pb-20 sm:pb-28">
        <div className="mx-auto" style={{ maxWidth: "720px" }}>
          {CHANGELOG.map((month) => (
            <div key={month.month} className="mb-14 last:mb-0">
              {/* Month header */}
              <h2 className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider mb-6 pb-3 border-b border-[#E5E7EB]">
                {month.month}
              </h2>

              {month.days.map((day) => (
                <div key={day.date} className="mb-10 last:mb-0">
                  {/* Date */}
                  <p className="text-[14px] font-semibold text-[#111827] mb-4">
                    {day.date}
                  </p>

                  {/* Entry cards */}
                  <div className="flex flex-col gap-3">
                    {day.entries.map((entry, idx) => {
                      const badge = BADGE_STYLES[entry.category];
                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 hover:border-[#D1D5DB] transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 mt-0.5"
                              style={{
                                background: badge.bg,
                                color: badge.text,
                              }}
                            >
                              {badge.label}
                            </span>
                            <div>
                              <p className="text-[15px] font-semibold text-[#111827] mb-1">
                                {entry.title}
                              </p>
                              <p className="text-[14px] text-[#4B5563] leading-relaxed">
                                {entry.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* CTA */}
          <div className="mt-16 rounded-2xl border border-[#2563EB]/15 bg-[#EFF6FF] p-8 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-3">
              Try SerpVive free
            </h2>
            <p className="text-[15px] text-[#4B5563] mb-6 max-w-md mx-auto">
              See your blog&apos;s Health Score and get your first AI diagnosis
              in minutes. No credit card required.
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
