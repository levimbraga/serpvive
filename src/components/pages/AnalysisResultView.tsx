"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain, Sparkles, ChevronDown, ChevronUp, Copy, Check, ArrowLeft, ExternalLink,
} from "lucide-react";

type DiagnosisData = {
  summary?: string;
  causes?: {
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
    evidence: string;
    category: string;
  }[];
  serp_analysis?: {
    top_competitors?: { url: string; title: string; strengths: string[] }[];
    intent_type?: string;
    content_format_trend?: string;
  };
};

type BriefData = {
  total_effort_hours?: number;
  actions?: {
    priority: "urgent" | "important" | "nice_to_have";
    title: string;
    description: string;
    effort_minutes: number;
    category: string;
    micro_draft: {
      type: string;
      suggestions: string[];
      competitor_references?: string[];
    };
  }[];
};

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  high:   { color: "#DC2626", bg: "#FEF2F2", label: "High" },
  medium: { color: "#D97706", bg: "#FFFBEB", label: "Medium" },
  low:    { color: "#16A34A", bg: "#F0FDF4", label: "Low" },
};

const PRIORITY_CONFIG: Record<string, { emoji: string; label: string }> = {
  urgent:       { emoji: "\uD83D\uDD34", label: "Urgent" },
  important:    { emoji: "\uD83D\uDFE1", label: "Important" },
  nice_to_have: { emoji: "\uD83D\uDFE2", label: "Nice to have" },
};

type Props = {
  url: string;
  keyword: string;
  diagnosis: Record<string, unknown>;
  brief: Record<string, unknown> | null;
  createdAt: string;
  badge: string;
  backHref?: string;
  backLabel?: string;
  hideBackLink?: boolean;
};

export default function AnalysisResultView({
  url,
  keyword,
  diagnosis: rawDiag,
  brief: rawBrief,
  createdAt,
  badge,
  backHref = "/pages",
  backLabel = "Back to Pages",
  hideBackLink = false,
}: Props) {
  const diagnosis = rawDiag as DiagnosisData;
  const brief = rawBrief as BriefData | null;
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {!hideBackLink && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> {backLabel}
        </Link>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#3B82F6] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
            {badge}
          </span>
          <span className="text-xs text-[#9CA3AF]">
            {new Date(createdAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <ExternalLink size={14} strokeWidth={1.5} className="text-[#6B7280] flex-shrink-0" />
          <p className="text-sm font-medium text-[#111827] truncate" style={{ fontFamily: "var(--font-mono, monospace)" }}>
            {url}
          </p>
        </div>
        <p className="text-xs text-[#6B7280] mt-1">Keyword: {keyword}</p>
      </div>

      {/* Diagnosis */}
      {diagnosis.summary && (
        <div className="bg-white rounded-xl border-2 border-[#7C3AED]/20 p-6 space-y-5">
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <Brain size={18} strokeWidth={1.5} className="text-[#7C3AED]" />
            Content Analysis
          </h2>

          <p className="text-sm text-[#374151] leading-relaxed">{diagnosis.summary}</p>

          {diagnosis.causes && diagnosis.causes.length > 0 && (
            <div className="space-y-3">
              {diagnosis.causes.map((cause, i) => {
                const sev = SEVERITY_CONFIG[cause.severity] ?? SEVERITY_CONFIG.medium;
                return (
                  <div key={i} className="rounded-lg border border-[#E5E7EB] p-4" style={{ borderLeftWidth: 3, borderLeftColor: sev.color }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm font-medium text-[#111827]">{cause.title}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: sev.color, backgroundColor: sev.bg }}>
                        {sev.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#4B5563] mb-2">{cause.description}</p>
                    <p className="text-xs text-[#6B7280] italic">{cause.evidence}</p>
                  </div>
                );
              })}
            </div>
          )}

          {diagnosis.serp_analysis && (
            <div className="bg-[#F9FAFB] rounded-lg p-4">
              <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">SERP Insight</h3>
              <div className="flex flex-wrap gap-4 text-xs text-[#374151]">
                {diagnosis.serp_analysis.intent_type && (
                  <div>
                    <span className="text-[#9CA3AF]">Intent: </span>
                    <span className="font-medium capitalize">{diagnosis.serp_analysis.intent_type}</span>
                  </div>
                )}
                {diagnosis.serp_analysis.content_format_trend && (
                  <div>
                    <span className="text-[#9CA3AF]">Format trend: </span>
                    <span className="font-medium">{diagnosis.serp_analysis.content_format_trend}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Brief */}
      {brief?.actions && brief.actions.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
              <Sparkles size={18} strokeWidth={1.5} className="text-[#D97706]" />
              Refresh Brief
            </h2>
            {brief.total_effort_hours && (
              <span className="text-xs text-[#6B7280]">~{brief.total_effort_hours}h total effort</span>
            )}
          </div>

          <div className="space-y-2">
            {brief.actions.map((action, i) => {
              const pri = PRIORITY_CONFIG[action.priority] ?? PRIORITY_CONFIG.important;
              const isExpanded = expandedIdx === i;
              return (
                <div key={i} className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedIdx(isExpanded ? null : i)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#F9FAFB] transition-colors"
                  >
                    <span className="text-sm">{pri.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[#111827] truncate">{action.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-[#9CA3AF] mt-0.5">
                        <span>{action.effort_minutes} min</span>
                        <span className="capitalize">{action.category}</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={16} strokeWidth={1.5} className="text-[#9CA3AF]" /> : <ChevronDown size={16} strokeWidth={1.5} className="text-[#9CA3AF]" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      <p className="text-sm text-[#4B5563]">{action.description}</p>
                      {action.micro_draft.suggestions.length > 0 && (
                        <MicroDraft suggestions={action.micro_draft.suggestions} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MicroDraft({ suggestions }: { suggestions: string[] }) {
  const [copied, setCopied] = useState(false);
  const text = suggestions.join("\n\n");

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-3 relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-[#BBF7D0] text-[#16A34A] transition-colors"
        title="Copy micro-draft"
      >
        {copied ? <Check size={14} strokeWidth={1.5} /> : <Copy size={14} strokeWidth={1.5} />}
      </button>
      <p className="text-[10px] font-semibold text-[#16A34A] uppercase tracking-wider mb-2">Micro-draft</p>
      <div className="space-y-1.5 pr-8">
        {suggestions.map((s, i) => (
          <p key={i} className="text-sm text-[#166534]">{s}</p>
        ))}
      </div>
    </div>
  );
}
