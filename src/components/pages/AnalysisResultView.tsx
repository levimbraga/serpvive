"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain, Sparkles, ChevronDown, ChevronUp, Copy, Check, ArrowLeft, ExternalLink,
  CheckCircle2, Shield,
} from "lucide-react";

type TopicCoverage = {
  covered: number;
  total: number;
  percentage: number;
  missing: string[];
};

type DiagnosisData = {
  summary?: string;
  strengths?: string[];
  topic_coverage?: TopicCoverage;
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

const PRIORITY_CONFIG: Record<string, { textColor: string; bg: string; label: string }> = {
  urgent:       { textColor: "text-[#EF4444]", bg: "bg-[rgba(239,68,68,0.1)]", label: "Urgent" },
  important:    { textColor: "text-[#F59E0B]", bg: "bg-[rgba(245,158,11,0.1)]", label: "Important" },
  nice_to_have: { textColor: "text-[#22C55E]", bg: "bg-[rgba(34,197,94,0.1)]", label: "Nice to have" },
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
  const [expandedEvidence, setExpandedEvidence] = useState<Set<number>>(new Set());

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
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5">
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
        <div className="bg-white rounded-lg border-2 border-[#7C3AED]/20 p-6 space-y-5">
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <Brain size={18} strokeWidth={1.5} className="text-[#7C3AED]" />
            Content Analysis
          </h2>

          <p className="text-sm text-[#374151] leading-relaxed">{diagnosis.summary}</p>

          {/* Topic Coverage */}
          {diagnosis.topic_coverage && (
            <div className="bg-[#F9FAFB] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Topic Coverage</h3>
                <span className="text-sm font-semibold text-[#111827]">
                  {diagnosis.topic_coverage.covered} / {diagnosis.topic_coverage.total} ({diagnosis.topic_coverage.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(diagnosis.topic_coverage.percentage, 100)}%`,
                    backgroundColor: diagnosis.topic_coverage.percentage >= 80 ? "#16A34A" : diagnosis.topic_coverage.percentage >= 50 ? "#D97706" : "#DC2626",
                  }}
                />
              </div>
              {diagnosis.topic_coverage.missing.length > 0 && (
                <p className="text-xs text-[#6B7280] mt-2">
                  <span className="font-medium text-[#374151]">Missing:</span>{" "}
                  {diagnosis.topic_coverage.missing.join(", ")}
                </p>
              )}
            </div>
          )}

          {/* Healthy page — no causes */}
          {(!diagnosis.causes || diagnosis.causes.length === 0) && (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={22} strokeWidth={1.5} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-[#166534]">Your page is in great shape!</h3>
                  <p className="text-sm text-[#15803D] leading-relaxed">
                    We analyzed your content against the top 10 SERP results and found no critical issues. Your page is well-optimized for &ldquo;{keyword}&rdquo;.
                  </p>

                  {/* Strengths — proof of analysis */}
                  {diagnosis.strengths && diagnosis.strengths.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#166534] uppercase tracking-wider mb-2">What you&apos;re doing right</p>
                      <ul className="space-y-1.5">
                        {diagnosis.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-[#15803D] flex gap-2">
                            <span className="text-[#16A34A] flex-shrink-0">✓</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {diagnosis.topic_coverage && (
                    <p className="text-sm text-[#15803D]">
                      Topic Coverage: {diagnosis.topic_coverage.covered} / {diagnosis.topic_coverage.total} ({diagnosis.topic_coverage.percentage}%)
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-[#16A34A]">
                    <Shield size={12} strokeWidth={1.5} />
                    <span>Keep monitoring — we&apos;ll alert you if anything changes in the SERP.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Strengths — always shown when causes > 0 */}
          {diagnosis.causes && diagnosis.causes.length > 0 && diagnosis.strengths && diagnosis.strengths.length > 0 && (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-4 mb-1">
              <p className="text-xs font-semibold text-[#166534] uppercase tracking-wider mb-2">What you&apos;re doing right</p>
              <ul className="space-y-1.5">
                {diagnosis.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-[#15803D] flex gap-2">
                    <span className="text-[#16A34A] flex-shrink-0">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Single low-severity cause — healthy header */}
          {diagnosis.causes && diagnosis.causes.length === 1 && diagnosis.causes[0]?.severity === "low" && (
            <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-4 py-3 mb-1">
              <CheckCircle2 size={16} strokeWidth={1.5} className="text-[#16A34A] flex-shrink-0" />
              <p className="text-sm text-[#166534]">
                Your page is performing well. We found 1 optional improvement:
              </p>
            </div>
          )}

          {diagnosis.causes && diagnosis.causes.length > 0 && (
            <div className="space-y-3">
              {diagnosis.causes.map((cause, i) => {
                const sev = SEVERITY_CONFIG[cause.severity] ?? { color: "#D97706", bg: "#FFFBEB", label: "Medium" };
                return (
                  <div key={i} className="rounded-lg border border-[#E5E7EB] p-4" style={{ borderLeftWidth: 3, borderLeftColor: sev.color }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm font-medium text-[#111827]">{cause.title}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: sev.color, backgroundColor: sev.bg }}>
                        {sev.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#4B5563] mb-2">{cause.description}</p>
                    <button
                      onClick={() => setExpandedEvidence(prev => {
                        const next = new Set(prev);
                        next.has(i) ? next.delete(i) : next.add(i);
                        return next;
                      })}
                      className="flex items-center gap-1 mt-2 text-xs text-[#6B7280] hover:text-[#4B5563] transition-colors"
                    >
                      {expandedEvidence.has(i) ? "Hide evidence" : "Show evidence"}
                      <ChevronDown size={12} strokeWidth={1.5} className={`transition-transform duration-150 ${expandedEvidence.has(i) ? "rotate-180" : ""}`} />
                    </button>
                    {expandedEvidence.has(i) && (
                      <p className="text-xs text-[#6B7280] mt-2 italic leading-relaxed bg-[#F9FAFB] rounded-md p-3">
                        {cause.evidence}
                      </p>
                    )}
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

      {/* Brief — empty actions (healthy page) */}
      {brief && (!brief.actions || brief.actions.length === 0) && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2 mb-3">
            <Sparkles size={18} strokeWidth={1.5} className="text-[#D97706]" />
            Refresh Brief
          </h2>
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield size={18} strokeWidth={1.5} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#166534] leading-relaxed">
                No urgent actions needed. Your content is competitive. We&apos;ll continue monitoring and alert you if competitors make moves that affect your position.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Brief */}
      {brief?.actions && brief.actions.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 space-y-4">
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
              const pri = PRIORITY_CONFIG[action.priority] ?? { textColor: "text-[#F59E0B]", bg: "bg-[rgba(245,158,11,0.1)]", label: "Important" };
              const isExpanded = expandedIdx === i;
              return (
                <div key={i} className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedIdx(isExpanded ? null : i)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#F9FAFB] transition-colors"
                  >
                    <span className={`text-[11px] font-medium ${pri.textColor} ${pri.bg} px-2 py-0.5 rounded-full flex-shrink-0`}>
                      {pri.label}
                    </span>
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
