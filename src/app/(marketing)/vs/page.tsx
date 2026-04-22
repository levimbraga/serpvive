import { Metadata } from "next";
import Link from "next/link";
import { getAllComparisons } from "@/lib/comparisons";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import WaitlistCTA from "@/components/marketing/WaitlistCTA";
import { ArrowRight, Shield, Check, X as XIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "SerpVive vs Competitors: Honest SEO Tool Comparisons (2026)",
  description:
    "See how SerpVive compares to Semrush, Surfer SEO, and Frase. Side-by-side feature tables, pricing, and honest analysis of who each tool is best for.",
  alternates: { canonical: "https://serpvive.com/vs" },
  robots: { index: true, follow: true },
};

const SUMMARY_FEATURES = [
  "Starting price",
  "Decay detection",
  "AI diagnosis",
  "Micro-drafts",
  "Result tracking",
  "Health Score",
  "Keyword research",
  "Content editor",
  "Free plan",
];

type CompetitorSummary = {
  name: string;
  slug: string;
  values: Record<string, string>;
};

function getCompetitorSummaries(): CompetitorSummary[] {
  const all = getAllComparisons();
  return all.map((c) => {
    const vals: Record<string, string> = {};
    for (const f of c.features) {
      const fname = f.feature.toLowerCase();
      if (fname === "starting price") vals["Starting price"] = f.competitor;
      if (fname.includes("decay detection")) vals["Decay detection"] = f.competitor;
      if (fname.includes("ai diagnosis")) vals["AI diagnosis"] = f.competitor;
      if (fname.includes("micro-draft")) vals["Micro-drafts"] = f.competitor;
      if (fname.includes("result tracking")) vals["Result tracking"] = f.competitor;
      if (fname.includes("health score")) vals["Health Score"] = f.competitor;
      if (fname.includes("keyword research")) vals["Keyword research"] = f.competitor;
      if (fname.includes("content editor")) vals["Content editor"] = f.competitor;
      if (fname.includes("free plan")) vals["Free plan"] = f.competitor;
    }
    return { name: c.competitorName, slug: c.slug, values: vals };
  });
}

const SERPVIVE_VALUES: Record<string, string> = {
  "Starting price": "Free ($0)",
  "Decay detection": "Automatic, daily",
  "AI diagnosis": "Yes (advanced AI)",
  "Micro-drafts": "Yes",
  "Result tracking": "Yes (28 days)",
  "Health Score": "Yes (0-100)",
  "Keyword research": "No",
  "Content editor": "No",
  "Free plan": "Yes (forever free)",
};

function CellValue({ value }: { value: string }) {
  if (value === "Yes" || value.startsWith("Yes ")) {
    return (
      <span className="flex items-center gap-1.5 text-[#059669]">
        <Check size={14} strokeWidth={2} />
        <span className="text-[13px]">{value}</span>
      </span>
    );
  }
  if (value === "No") {
    return (
      <span className="flex items-center gap-1.5 text-[#D1D5DB]">
        <XIcon size={14} strokeWidth={2} />
        <span className="text-[13px]">No</span>
      </span>
    );
  }
  return <span className="text-[13px] text-[#374151]">{value}</span>;
}

export default function ComparisonsIndex() {
  const comparisons = getAllComparisons();
  const summaries = getCompetitorSummaries();

  return (
    <>
      <Navbar />

      {/* Dark Hero */}
      <header
        className="pt-36 pb-12 sm:pt-40 sm:pb-16 px-5 sm:px-12 text-center"
        style={{ background: "#07090F" }}
      >
        <div className="mx-auto" style={{ maxWidth: "720px" }}>
          <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#3B82F6] bg-[#3B82F6]/10 px-4 py-1.5 rounded-full mb-6">
            <Shield size={14} strokeWidth={1.5} />
            Honest Comparisons
          </div>
          <h1
            className="font-extrabold text-[#F1F5F9] tracking-tight mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
          >
            How SerpVive Compares
          </h1>
          <p
            className="text-[#94A3B8] mx-auto"
            style={{ fontSize: "clamp(15px, 1.2vw, 18px)", maxWidth: "520px" }}
          >
            Honest, side-by-side comparisons with the tools you already know.
            We show where they win, too.
          </p>
        </div>
      </header>

      {/* Content (Light) */}
      <section className="bg-white px-5 sm:px-12 pt-12 sm:pt-16 pb-20 sm:pb-28">
        <div className="mx-auto" style={{ maxWidth: "960px" }}>
          {/* Comparison Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {comparisons.map((comp) => (
              <Link
                key={comp.slug}
                href={`/vs/${comp.slug}`}
                className="group block rounded-xl border border-[#E5E7EB] bg-white p-6 no-underline transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <p className="text-[12px] font-bold text-[#2563EB] uppercase tracking-wider mb-3">
                  SerpVive vs
                </p>
                <h2 className="text-xl font-bold text-[#111827] mb-2 group-hover:text-[#2563EB] transition-colors">
                  {comp.competitorName}
                </h2>
                <p className="text-[14px] text-[#4B5563] leading-relaxed mb-5 line-clamp-2">
                  {comp.tldr.summary.slice(0, 120)}...
                </p>

                <div className="flex flex-col gap-1.5 mb-5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">{comp.competitorName}</span>
                    <span className="font-medium text-[#111827]">
                      {comp.pricing[1]?.competitor.split(":")[1]?.trim() ?? "Paid"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2563EB] font-medium">SerpVive</span>
                    <span className="font-medium text-[#2563EB]">Free</span>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-[14px] font-medium text-[#2563EB] group-hover:gap-2.5 transition-all">
                  Read comparison <ArrowRight size={14} strokeWidth={1.5} />
                </span>
              </Link>
            ))}
          </div>

          {/* Summary Table */}
          <div className="mb-16">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-6">
              All comparisons at a glance
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-left text-[13px]" style={{ minWidth: "640px" }}>
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="px-4 py-3 font-semibold text-[#6B7280] w-[20%]">
                      Feature
                    </th>
                    {summaries.map((s) => (
                      <th key={s.slug} className="px-4 py-3 font-semibold text-[#6B7280]">
                        <Link
                          href={`/vs/${s.slug}`}
                          className="hover:text-[#2563EB] no-underline transition-colors"
                        >
                          {s.name}
                        </Link>
                      </th>
                    ))}
                    <th className="px-4 py-3 font-semibold text-[#2563EB] bg-[#EFF6FF]/50">
                      SerpVive
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SUMMARY_FEATURES.map((feature, i) => (
                    <tr
                      key={feature}
                      className={`border-b border-[#E5E7EB]/60 ${
                        i % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]/50"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-[#111827]">
                        {feature}
                      </td>
                      {summaries.map((s) => (
                        <td key={s.slug} className="px-4 py-3">
                          <CellValue value={s.values[feature] ?? "N/A"} />
                        </td>
                      ))}
                      <td className="px-4 py-3 bg-[#EFF6FF]/30">
                        <CellValue value={SERPVIVE_VALUES[feature] ?? "N/A"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transparency note */}
          <div className="text-center mb-12">
            <p className="text-[15px] text-[#4B5563] max-w-lg mx-auto leading-relaxed">
              We&apos;re transparent about what SerpVive does and doesn&apos;t do.
              These comparisons include where competitors win. We believe you
              should choose the best tool for your needs.
            </p>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-[#2563EB]/15 bg-[#EFF6FF] p-8 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-3">
              Try SerpVive Free
            </h2>
            <p className="text-[15px] text-[#4B5563] mb-6 max-w-md mx-auto">
              No credit card required. See your Health Score and get your first
              AI diagnosis in minutes.
            </p>
            <WaitlistCTA
              source="vs_index"
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] text-white font-semibold px-6 py-3 text-[15px] hover:bg-[#1D4ED8] transition-all cursor-pointer"
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
