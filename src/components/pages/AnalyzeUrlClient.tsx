"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap, Search, FileText, Brain, Sparkles, CheckCircle2, Loader2,
  AlertCircle, ChevronDown, ChevronUp, Copy, Check, ArrowLeft, Info,
} from "lucide-react";

type DiagnosisCause = {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  evidence: string;
  category: string;
};

type TopicCoverage = {
  covered: number;
  total: number;
  percentage: number;
  missing: string[];
};

type DiagnosisData = {
  summary: string;
  topic_coverage?: TopicCoverage;
  causes: DiagnosisCause[];
  serp_analysis: {
    top_competitors: { url: string; title: string; strengths: string[] }[];
    intent_type: string;
    content_format_trend: string;
  };
};

type BriefAction = {
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
};

type BriefData = {
  total_effort_hours: number;
  actions: BriefAction[];
};

const SEVERITY_CONFIG = {
  high:   { color: "#DC2626", bg: "#FEF2F2", label: "High" },
  medium: { color: "#D97706", bg: "#FFFBEB", label: "Medium" },
  low:    { color: "#16A34A", bg: "#F0FDF4", label: "Low" },
};

const PRIORITY_CONFIG = {
  urgent:       { textColor: "text-[#EF4444]", bg: "bg-[rgba(239,68,68,0.1)]", label: "Urgent" },
  important:    { textColor: "text-[#F59E0B]", bg: "bg-[rgba(245,158,11,0.1)]", label: "Important" },
  nice_to_have: { textColor: "text-[#22C55E]", bg: "bg-[rgba(34,197,94,0.1)]", label: "Nice to have" },
};

type AnalyzeUrlClientProps = {
  diagnosesUsed: number;
  diagnosesLimit: number;
  plan: string;
};

export default function AnalyzeUrlClient({ diagnosesUsed, diagnosesLimit, plan }: AnalyzeUrlClientProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null);
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const remaining = diagnosesLimit - diagnosesUsed;
  const canAnalyze = plan !== "free" && remaining > 0;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  async function handleAnalyze() {
    if (!url.trim() || !keyword.trim()) return;

    setStatus("loading");
    setError("");
    setLoadingStep(0);
    setElapsedSeconds(0);
    setDiagnosis(null);
    setBrief(null);

    // Start timer
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);

    // Simulate steps
    const t1 = setTimeout(() => setLoadingStep(1), 15000);
    const t2 = setTimeout(() => setLoadingStep(2), 40000);
    const t3 = setTimeout(() => setLoadingStep(3), 80000);
    timeoutsRef.current = [t1, t2, t3];

    try {
      const res = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), keyword: keyword.trim() }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Analysis failed");
      }

      setDiagnosis(json.data.diagnosis);
      setBrief(json.data.brief);
      setAnalysisId(json.data.analysisId);
      setStatus("done");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      timeoutsRef.current.forEach(clearTimeout);
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const STEPS = [
    { icon: Search, label: "Fetching SERP data..." },
    { icon: FileText, label: "Analyzing competitor content..." },
    { icon: Brain, label: "AI is diagnosing your page..." },
    { icon: Sparkles, label: "Generating refresh brief..." },
  ];

  // ── Form / Loading / Error ──
  if (status !== "done") {
    return (
      <div className="max-w-lg mx-auto">
        <Link
          href="/pages"
          className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] mb-6 transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Back to Pages
        </Link>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
              <Zap size={20} strokeWidth={1.5} className="text-[#3B82F6]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#111827]">Analyze any page</h1>
              <p className="text-xs text-[#6B7280]">AI diagnosis with competitor analysis</p>
            </div>
          </div>

          {status === "loading" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-[#111827]">Analyzing your page...</h3>
                <span className="text-xs text-[#9CA3AF] tabular-nums">{formatTime(elapsedSeconds)} elapsed</span>
              </div>
              {STEPS.map(({ icon: Icon, label }, i) => {
                const isDone = i < loadingStep;
                const isActive = i === loadingStep;
                return (
                  <div key={i} className="flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle2 size={18} strokeWidth={1.5} className="text-[#16A34A]" />
                    ) : isActive ? (
                      <Loader2 size={18} strokeWidth={1.5} className="text-[#7C3AED] animate-spin" />
                    ) : (
                      <Icon size={18} strokeWidth={1.5} className="text-[#D1D5DB]" />
                    )}
                    <span className={`text-sm ${isActive ? "text-[#111827] font-medium" : isDone ? "text-[#6B7280]" : "text-[#D1D5DB]"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
              <p className="text-xs text-[#9CA3AF] mt-4">
                Usually takes 2-3 minutes. You can navigate away — the result will be saved.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">URL *</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yoursite.com/blog/your-post"
                  className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: "var(--font-mono, monospace)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Target keyword *</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="best project management tools 2026"
                  className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                />
              </div>

              {status === "error" && (
                <div className="flex items-start gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3">
                  <AlertCircle size={16} strokeWidth={1.5} className="text-[#DC2626] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[#991B1B]">{error}</p>
                </div>
              )}

              {!canAnalyze ? (
                <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-3">
                  <p className="text-sm text-[#92400E]">
                    {plan === "free"
                      ? "Upgrade to a paid plan to run AI analyses."
                      : `You've used all ${diagnosesLimit} diagnoses this month. Upgrade for more.`
                    }
                  </p>
                  <Link
                    href="/settings"
                    className="inline-block mt-2 text-sm font-medium text-[#D97706] hover:text-[#92400E]"
                  >
                    Upgrade plan &rarr;
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleAnalyze}
                  disabled={!url.trim() || keyword.trim().length < 2}
                  className="w-full h-10 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Zap size={16} strokeWidth={1.5} />
                  Analyze
                </button>
              )}

              <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                <Info size={12} strokeWidth={1.5} />
                <span>
                  Uses 1 AI diagnosis ({remaining}/{diagnosesLimit} remaining). Takes 2-3 min.
                </span>
              </div>
              <p className="text-[10px] text-[#D1D5DB] leading-relaxed">
                Only public HTTPS pages are supported. We fetch the page content server-side to run the analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Results ──
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/pages"
          className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> Back to Pages
        </Link>
        <button
          onClick={() => { setStatus("idle"); setDiagnosis(null); setBrief(null); }}
          className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium"
        >
          Analyze another page
        </button>
      </div>

      {/* URL + keyword header */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#3B82F6] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
            Page Analysis
          </span>
          {analysisId && (
            <Link
              href={`/pages/analyze/${analysisId}`}
              className="text-xs text-[#6B7280] hover:text-[#3B82F6] transition-colors flex items-center gap-1"
            >
              Saved — view permalink
              <ArrowLeft size={10} strokeWidth={1.5} className="rotate-180" />
            </Link>
          )}
        </div>
        <p className="text-sm font-medium text-[#111827] truncate" style={{ fontFamily: "var(--font-mono, monospace)" }}>
          {url}
        </p>
        <p className="text-xs text-[#6B7280] mt-1">Keyword: {keyword}</p>
      </div>

      {/* Diagnosis Card */}
      {diagnosis && <DiagnosisCard diagnosis={diagnosis} />}

      {/* Brief Card */}
      {brief && <BriefCard brief={brief} />}
    </div>
  );
}

// ── DiagnosisCard ──
function DiagnosisCard({ diagnosis }: { diagnosis: DiagnosisData }) {
  return (
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

      <div className="space-y-3">
        {diagnosis.causes.map((cause, i) => {
          const sev = SEVERITY_CONFIG[cause.severity];
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

      {/* SERP Insight */}
      <div className="bg-[#F9FAFB] rounded-lg p-4">
        <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">SERP Insight</h3>
        <div className="flex flex-wrap gap-4 text-xs text-[#374151]">
          <div>
            <span className="text-[#9CA3AF]">Intent: </span>
            <span className="font-medium capitalize">{diagnosis.serp_analysis.intent_type}</span>
          </div>
          <div>
            <span className="text-[#9CA3AF]">Format trend: </span>
            <span className="font-medium">{diagnosis.serp_analysis.content_format_trend}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── BriefCard ──
function BriefCard({ brief }: { brief: BriefData }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
          <Sparkles size={18} strokeWidth={1.5} className="text-[#D97706]" />
          Refresh Brief
        </h2>
        <span className="text-xs text-[#6B7280]">
          ~{brief.total_effort_hours}h total effort
        </span>
      </div>

      <div className="space-y-2">
        {brief.actions.map((action, i) => {
          const pri = PRIORITY_CONFIG[action.priority];
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
  );
}

// ── MicroDraft ──
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
      <div className="space-y-1.5 pr-8 font-mono">
        {suggestions.map((s, i) => (
          <p key={i} className="text-sm text-[#166534]">{s}</p>
        ))}
      </div>
    </div>
  );
}
