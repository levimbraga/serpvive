"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import posthog from "posthog-js";
import AnalysisResultView from "@/components/pages/AnalysisResultView";

type DiagnosisData = {
  summary?: string;
  causes?: { title: string; severity: string }[];
  serp_analysis?: {
    top_competitors?: { url: string; title: string; strengths: string[] }[];
  };
};

type Props = {
  url: string;
  keyword: string;
  diagnosis: Record<string, unknown>;
  brief: Record<string, unknown> | null;
  createdAt: string;
  demoId: string;
};

export default function DemoResultClient({ url, keyword, diagnosis, brief, createdAt, demoId }: Props) {
  const diag = diagnosis as DiagnosisData;
  const causesCount = diag.causes?.length ?? 0;
  const competitorCount = diag.serp_analysis?.top_competitors?.length ?? 0;

  return (
    <div className="space-y-0">
      {/* Metadata line */}
      <div className="mb-6">
        <p className="text-xs text-[#9CA3AF]">
          Analyzed {competitorCount} competitors &middot; Keyword: &ldquo;{keyword}&rdquo; &middot; {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Analysis content */}
      <AnalysisResultView
        url={url}
        keyword={keyword}
        diagnosis={diagnosis}
        brief={brief}
        createdAt={createdAt}
        badge="Free Analysis"
        hideBackLink
      />

      {/* Inline CTA — between analysis and methodology */}
      <div className="border-l-2 border-[#3B82F6]/30 pl-4 my-6 text-sm text-[#6B7280]">
        This is one page. SerpVive tracks your entire blog automatically —
        scoring decline, diagnosing why, and showing you what to fix.
        <a
          href="/signup"
          onClick={() => posthog.capture("demo_inline_cta_clicked", { demo_id: demoId })}
          className="text-[#3B82F6] hover:underline ml-1 font-medium"
        >
          Start free &rarr;
        </a>
      </div>

      {/* Share buttons */}
      <ShareBar demoId={demoId} causesCount={causesCount} />

      {/* How we analyzed this */}
      <details
        className="mt-6 border border-[#E5E7EB] rounded-lg bg-white"
        onToggle={(e) => {
          if ((e.target as HTMLDetailsElement).open) {
            posthog.capture("demo_methodology_viewed", { demo_id: demoId });
          }
        }}
      >
        <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-[#6B7280] hover:text-[#111827]">
          How this analysis was performed
        </summary>
        <div className="px-4 pb-4 text-sm text-[#6B7280] space-y-2">
          <p>1. Searched Google for &ldquo;<strong>{keyword}</strong>&rdquo; and retrieved the top 10 organic results</p>
          <p>2. Extracted full content from your page and the top 3 competitors (JavaScript rendering enabled)</p>
          <p>3. Compared word count, heading structure, internal/external links, publication dates, and topic coverage</p>
          <p>4. AI analyzed the competitive landscape, identified content gaps, and diagnosed ranking barriers</p>
          <p>5. Generated prioritized actions with specific micro-drafts based on what top competitors do differently</p>
          <p className="text-xs pt-2 border-t border-[#E5E7EB]">Analysis powered by AI &middot; Real-time SERP data &middot; Full content extraction</p>
        </div>
      </details>
    </div>
  );
}

function ShareBar({ demoId, causesCount }: { demoId: string; causesCount: number }) {
  const [copied, setCopied] = useState(false);

  function handleShare(platform: "twitter" | "linkedin" | "copy_link") {
    posthog.capture("demo_shared", { demo_id: demoId, platform });
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    if (platform === "twitter") {
      const text = `AI just analyzed my blog post and found ${causesCount} issue${causesCount !== 1 ? "s" : ""} I didn't know about. Check it out:`;
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`, "_blank");
    } else if (platform === "linkedin") {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`, "_blank");
    } else {
      navigator.clipboard.writeText(pageUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="flex items-center gap-3 mt-4">
      <span className="text-xs text-[#9CA3AF]">Share this analysis:</span>
      <button onClick={() => handleShare("twitter")} className="text-xs text-[#6B7280] hover:text-[#111827] transition-colors">
        Twitter/X
      </button>
      <button onClick={() => handleShare("copy_link")} className="text-xs text-[#6B7280] hover:text-[#111827] transition-colors flex items-center gap-1">
        {copied ? <><Check size={12} strokeWidth={1.5} /> Copied!</> : <><Link2 size={12} strokeWidth={1.5} /> Copy link</>}
      </button>
      <button onClick={() => handleShare("linkedin")} className="text-xs text-[#6B7280] hover:text-[#111827] transition-colors">
        LinkedIn
      </button>
    </div>
  );
}
