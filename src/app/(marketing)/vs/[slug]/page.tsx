import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getComparisonBySlug,
  getComparisonSlugs,
} from "@/lib/comparisons";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import ComparisonTable from "@/components/marketing/vs/ComparisonTable";
import PricingTable from "@/components/marketing/vs/PricingTable";
import FAQSection from "@/components/marketing/vs/FAQSection";
import {
  ArrowRight,
  Calendar,
  Shield,
  Zap,
  Info,
} from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getComparisonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getComparisonBySlug(slug);
  if (!data) return { title: "Comparison Not Found" };

  return {
    title: `${data.title} | SerpVive`,
    description: data.metaDescription,
    keywords: data.keywords,
    alternates: { canonical: `https://serpvive.com/vs/${slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: data.title,
      description: data.metaDescription,
      url: `https://serpvive.com/vs/${slug}`,
      siteName: "SerpVive",
      type: "article",
      publishedTime: data.publishedAt,
      modifiedTime: data.updatedAt,
      images: [
        {
          url: `https://serpvive.com/og/vs-${slug}.png`,
          width: 1200,
          height: 630,
          alt: `${data.competitorName} vs SerpVive comparison`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.metaDescription,
      creator: "@serpvive",
    },
  };
}

function renderMarkdown(text: string) {
  return text.split("\n\n").map((para, i) => {
    if (para.startsWith("### ")) {
      const heading = para.replace("### ", "");
      return (
        <h3
          key={i}
          className="text-lg font-semibold text-[#1F2937] mt-8 mb-3"
        >
          {heading}
        </h3>
      );
    }

    if (para.startsWith("- ") || para.startsWith("1. ")) {
      const items = para.split("\n").filter(Boolean);
      const isOrdered = para.startsWith("1. ");
      const Tag = isOrdered ? "ol" : "ul";
      return (
        <Tag key={i} className="mb-4 pl-5 flex flex-col gap-1.5">
          {items.map((item, j) => (
            <li
              key={j}
              className="text-[15px] text-[#374151] leading-relaxed"
            >
              {renderInline(
                item.replace(/^[-\d]+[.)]\s*/, "")
              )}
            </li>
          ))}
        </Tag>
      );
    }

    return (
      <p key={i} className="text-[15px] text-[#374151] leading-relaxed mb-4">
        {renderInline(para)}
      </p>
    );
  });
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-[#111827] font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const data = getComparisonBySlug(slug);
  if (!data) notFound();

  const relatedComparisons = data.relatedSlugs
    .map((s) => getComparisonBySlug(s))
    .filter(Boolean);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: data.h1,
      description: data.metaDescription,
      datePublished: data.publishedAt,
      dateModified: data.updatedAt,
      author: {
        "@type": "Person",
        name: "Levi",
        url: "https://serpvive.com/about",
      },
      publisher: {
        "@type": "Organization",
        name: "SerpVive",
        url: "https://serpvive.com",
      },
      mainEntityOfPage: `https://serpvive.com/vs/${slug}`,
      image: `https://serpvive.com/og/vs-${slug}.png`,
      about: [
        { "@type": "SoftwareApplication", name: "SerpVive" },
        { "@type": "SoftwareApplication", name: data.competitorName },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <>
      <Navbar />

      {/* JSON-LD structured data - source is our own typed comparison objects, safe */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <header
        className="pt-36 pb-12 sm:pt-40 sm:pb-16 px-5 sm:px-12"
        style={{ background: "#07090F" }}
      >
        <div className="mx-auto" style={{ maxWidth: "820px" }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#3B82F6] bg-[#3B82F6]/10 px-3 py-1 rounded-full">
              <Shield size={12} strokeWidth={1.5} />
              Honest Comparison
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-[#64748B]">
              <Calendar size={12} strokeWidth={1.5} />
              Updated{" "}
              {new Date(data.updatedAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h1
            className="font-extrabold text-[#F1F5F9] tracking-tight mb-5 leading-[1.15]"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            {data.h1}
          </h1>

          <p className="text-[16px] text-[#94A3B8] leading-relaxed">
            {data.metaDescription}
          </p>
        </div>
      </header>

      {/* Content (Light) */}
      <section
        className="pt-12 sm:pt-16 pb-20 sm:pb-28 px-5 sm:px-12"
        style={{ background: "#FFFFFF" }}
      >
        <div className="mx-auto flex flex-col gap-14" style={{ maxWidth: "820px" }}>
          {/* TL;DR Box */}
          <div className="rounded-2xl border border-[#0D9488]/20 bg-[#F0FDFA] p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#0D9488] uppercase tracking-wider mb-5">
              <Zap size={14} strokeWidth={1.5} />
              TL;DR
            </div>
            <div className="grid sm:grid-cols-2 gap-6 mb-5">
              <div>
                <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                  {data.competitorName} is best for
                </p>
                <p className="text-[14px] text-[#374151] leading-relaxed">
                  {data.tldr.competitorBestFor}
                </p>
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#0D9488] uppercase tracking-wider mb-2">
                  SerpVive is best for
                </p>
                <p className="text-[14px] text-[#374151] leading-relaxed">
                  {data.tldr.serpviveBestFor}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-[#0D9488]/15">
              <p className="text-[14px] text-[#4B5563] leading-relaxed">
                <strong className="text-[#111827]">The short version:</strong>{" "}
                {data.tldr.summary}
              </p>
            </div>
          </div>

          {/* Side-by-Side Table */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-5">
              {data.competitorName} vs SerpVive: Side-by-Side
            </h2>
            <ComparisonTable
              features={data.features}
              competitorName={data.competitorName}
            />
          </div>

          {/* What Competitor Does Best */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-5">
              What {data.competitorName} Does Best
            </h2>
            {renderMarkdown(data.competitorStrengths)}
          </div>

          {/* Where SerpVive Wins */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-5">
              Where SerpVive Wins
            </h2>
            {renderMarkdown(data.serpviveWins)}
          </div>

          {/* Feature-by-Feature Breakdown */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-5">
              Feature-by-Feature Breakdown
            </h2>
            {renderMarkdown(data.featureBreakdown)}
          </div>

          {/* Pricing Comparison */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-5">
              Pricing Comparison
            </h2>
            <PricingTable
              pricing={data.pricing}
              competitorName={data.competitorName}
            />
            <div className="mt-6">
              {renderMarkdown(data.pricingAnalysis)}
            </div>
          </div>

          {/* Who Should Choose Competitor */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-5">
              Who Should Choose {data.competitorName}
            </h2>
            {renderMarkdown(data.whoShouldChooseCompetitor)}
          </div>

          {/* Who Should Choose SerpVive */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-5">
              Who Should Choose SerpVive
            </h2>
            {renderMarkdown(data.whoShouldChooseSerpvive)}
          </div>

          {/* Can You Use Both */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-5">
              Can You Use Both?
            </h2>
            {renderMarkdown(data.canUseBoth)}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-5">
              Frequently Asked Questions
            </h2>
            <FAQSection faqs={data.faqs} />
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-[#0D9488]/20 bg-[#F0FDFA] p-8 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-3">
              Try SerpVive Free
            </h2>
            <p className="text-[15px] text-[#4B5563] mb-6 max-w-lg mx-auto">
              No credit card required. Connect your Google Search Console, see
              your Health Score, and get your first AI diagnosis in minutes.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0D9488] text-white font-semibold px-7 py-3.5 text-[15px] no-underline hover:bg-[#0F766E] transition-all hover:shadow-[0_0_30px_rgba(13,148,136,0.15)]"
            >
              Get Started Free
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>

          {/* Related Comparisons */}
          {relatedComparisons.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-[#111827] mb-4">
                Related Comparisons
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {relatedComparisons.map((comp) =>
                  comp ? (
                    <Link
                      key={comp.slug}
                      href={`/vs/${comp.slug}`}
                      className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 no-underline group hover:border-[#0D9488]/40 transition-colors"
                    >
                      <div>
                        <p className="text-[14px] font-semibold text-[#111827] group-hover:text-[#0D9488] transition-colors">
                          {comp.competitorName} vs SerpVive
                        </p>
                        <p className="text-[12px] text-[#6B7280] mt-0.5">
                          Honest comparison for 2026
                        </p>
                      </div>
                      <ArrowRight
                        size={16}
                        strokeWidth={1.5}
                        className="text-[#9CA3AF] group-hover:text-[#0D9488] transition-colors"
                      />
                    </Link>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2.5 p-4 rounded-lg bg-[#F3F4F6] text-[12px] text-[#6B7280]">
            <Info size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" />
            <span>
              This comparison was last updated on{" "}
              {new Date(data.updatedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              . Pricing and features may change. We strive for accuracy but
              recommend checking{" "}
              <a
                href={data.competitorUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-[#0D9488] hover:underline"
              >
                {data.competitorName}&apos;s website
              </a>{" "}
              for the latest information.
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
