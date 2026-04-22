import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import WaitlistCTA from "@/components/marketing/WaitlistCTA";
import {
  CheckCircle2,
  Search,
  BarChart3,
  FileText,
  Globe,
  RefreshCw,
  ArrowRight,
  ClipboardList,
  TrendingDown,
  Target,
  ExternalLink,
  Link2,
  Image,
  Clock,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "15-Step Content Refresh Checklist | SerpVive",
  description:
    "Free, actionable checklist to refresh decaying content and recover lost traffic. Covers data analysis, on-page SEO, content updates, and promotion.",
  alternates: {
    canonical: "https://serpvive.com/resources/content-decay-checklist",
  },
  openGraph: {
    title: "15-Step Content Refresh Checklist",
    description:
      "Free checklist to refresh decaying content and recover traffic. From the SerpVive team.",
    url: "https://serpvive.com/resources/content-decay-checklist",
    type: "article",
  },
};

const STEPS = [
  {
    phase: "Diagnose",
    color: "#EF4444",
    icon: TrendingDown,
    items: [
      {
        icon: BarChart3,
        title: "Check traffic trends in GSC",
        description:
          "Compare the last 3 months to the previous 3 months. Look for pages that lost 20%+ clicks or impressions.",
      },
      {
        icon: Search,
        title: "Check current SERP position",
        description:
          "Search your target keyword in an incognito window. Note your position and who ranks above you.",
      },
      {
        icon: Target,
        title: "Identify the decay pattern",
        description:
          "Is it gradual decline (content aging), sudden drop (algorithm update), or seasonal dip? Each requires a different fix.",
      },
    ],
  },
  {
    phase: "Analyze",
    color: "#F59E0B",
    icon: Search,
    items: [
      {
        icon: Globe,
        title: "Study the top 3 competitors",
        description:
          "Read the pages that now rank above yours. Note what they cover that you don't, their content format, and freshness.",
      },
      {
        icon: FileText,
        title: "Review search intent",
        description:
          "Has the intent changed? A keyword that was informational might now show product pages. Adapt or lose.",
      },
      {
        icon: ClipboardList,
        title: "Audit your content gaps",
        description:
          "List topics, questions, or subtopics that competitors cover and you don't. These are your biggest opportunities.",
      },
    ],
  },
  {
    phase: "Update Content",
    color: "#3B82F6",
    icon: RefreshCw,
    items: [
      {
        icon: Clock,
        title: "Update outdated data and statistics",
        description:
          'Replace old stats with current data. Change "2024" to "2026". Remove references to deprecated tools or methods.',
      },
      {
        icon: FileText,
        title: "Add missing sections and depth",
        description:
          "Fill the content gaps you found. Add new H2/H3 sections that competitors cover. Aim for comprehensive, not longer.",
      },
      {
        icon: Image,
        title: "Refresh visuals and media",
        description:
          "Update old screenshots, add new diagrams, embed relevant videos. Visual content improves dwell time and sharing.",
      },
      {
        icon: Zap,
        title: "Improve the intro and conclusion",
        description:
          "The first 100 words determine if users stay. Rewrite your intro with a clear hook and promise of value.",
      },
    ],
  },
  {
    phase: "On-Page SEO",
    color: "#22C55E",
    icon: Target,
    items: [
      {
        icon: FileText,
        title: "Optimize title tag and meta description",
        description:
          "Include the primary keyword naturally, add the current year, and make the title more compelling than competitors.",
      },
      {
        icon: Link2,
        title: "Fix internal linking",
        description:
          "Add 3-5 internal links to and from related content. Internal links pass authority and help Google understand topical relevance.",
      },
      {
        icon: ExternalLink,
        title: "Update external links and sources",
        description:
          "Replace broken outbound links. Add links to authoritative, recent sources. Remove links to competitors where possible.",
      },
    ],
  },
  {
    phase: "Publish & Monitor",
    color: "#7C3AED",
    icon: BarChart3,
    items: [
      {
        icon: RefreshCw,
        title: "Republish with updated date",
        description:
          "Update the published date in your CMS. Request re-indexing in Google Search Console. Share on social channels.",
      },
      {
        icon: BarChart3,
        title: "Track recovery for 4-8 weeks",
        description:
          "Monitor position and traffic weekly. Most refreshes show results in 2-4 weeks. If no improvement after 8 weeks, reassess.",
      },
    ],
  },
];

export default function ContentDecayChecklist() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-36 pb-14 sm:pt-40 sm:pb-18 px-5 sm:px-12 text-center"
        style={{ background: "#07090F" }}
      >
        <div className="mx-auto" style={{ maxWidth: "720px" }}>
          <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-4 py-1.5 rounded-full mb-6">
            <ClipboardList size={14} strokeWidth={1.5} />
            Free Resource
          </div>
          <h1
            className="font-extrabold text-[#F1F5F9] tracking-tight mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
          >
            15-Step Content Refresh Checklist
          </h1>
          <p
            className="text-[#94A3B8] mx-auto leading-relaxed"
            style={{
              fontSize: "clamp(15px, 1.2vw, 18px)",
              maxWidth: "560px",
            }}
          >
            A systematic, actionable checklist to diagnose and fix decaying
            content. Follow these steps to recover lost rankings and traffic.
          </p>
        </div>
      </section>

      {/* Checklist */}
      <section
        className="pb-20 sm:pb-28 px-5 sm:px-12"
        style={{ background: "#07090F" }}
      >
        <div className="mx-auto" style={{ maxWidth: "780px" }}>
          <div className="flex flex-col gap-12">
            {STEPS.map((phase, phaseIdx) => (
              <div key={phase.phase}>
                {/* Phase Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `${phase.color}15` }}
                  >
                    <phase.icon
                      size={18}
                      strokeWidth={1.5}
                      style={{ color: phase.color }}
                    />
                  </div>
                  <div>
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: phase.color }}
                    >
                      Phase {phaseIdx + 1}
                    </span>
                    <h2 className="text-lg font-bold text-[#F1F5F9]">
                      {phase.phase}
                    </h2>
                  </div>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-3 pl-2">
                  {phase.items.map((item, itemIdx) => {
                    const stepNum =
                      STEPS.slice(0, phaseIdx).reduce(
                        (sum, p) => sum + p.items.length,
                        0
                      ) +
                      itemIdx +
                      1;

                    return (
                      <div
                        key={item.title}
                        className="flex gap-4 p-5 rounded-xl border border-[#1E293B] bg-[#0F1219] hover:border-[#1E293B]/80 transition-colors"
                      >
                        <div className="flex items-start gap-3 shrink-0">
                          <span className="text-[13px] font-bold text-[#475569] font-mono w-6 text-right">
                            {String(stepNum).padStart(2, "0")}
                          </span>
                          <CheckCircle2
                            size={20}
                            strokeWidth={1.5}
                            className="text-[#1E293B] mt-0.5"
                          />
                        </div>
                        <div>
                          <h3 className="text-[15px] font-semibold text-[#F1F5F9] mb-1.5">
                            {item.title}
                          </h3>
                          <p className="text-[14px] text-[#94A3B8] leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-2xl border border-[#3B82F6]/20 bg-gradient-to-br from-[#3B82F6]/5 to-[#7C3AED]/5 p-8 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] mb-3">
              Skip the manual work
            </h2>
            <p className="text-[15px] text-[#94A3B8] mb-6 max-w-md mx-auto">
              SerpVive automates steps 1-6 and generates AI-powered refresh
              briefs for steps 7-13. Monitor, diagnose, and fix in one place.
            </p>
            <WaitlistCTA
              source="resources_checklist"
              className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] text-white font-semibold px-6 py-3 text-[15px] hover:bg-[#2563EB] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] cursor-pointer"
            >
              Join the waitlist
              <ArrowRight size={16} strokeWidth={1.5} />
            </WaitlistCTA>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
