"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  ArrowLeft, Loader2, Zap, ExternalLink,
  ChevronDown, ChevronUp, Check,
  PartyPopper, Timer, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type PageData = {
  id: string;
  url: string;
  path: string;
  status: string;
  current_clicks_28d: number;
  current_impressions_28d: number;
  current_ctr: number;
  current_avg_position: number;
  peak_clicks_monthly: number;
  peak_month: string | null;
  decay_score: number;
  decay_velocity_7d: number;
  primary_keyword: string | null;
  primary_position: number | null;
  last_diagnosis_at: string | null;
};

type Cause = {
  title: string;
  description: string;
  severity: string;
  evidence: string;
  category: string;
};

type DiagnosisData = {
  summary: string;
  causes: Cause[];
  serp_analysis: {
    top_competitors: { url: string; title: string; strengths: string[] }[];
    intent_type: string;
    content_format_trend: string;
  };
};

type BriefAction = {
  priority: string;
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

type DiagnosisRecord = {
  id: string;
  diagnosis: DiagnosisData;
  refresh_brief: BriefData | null;
  cost_usd: number | null;
  processing_time_ms: number | null;
  created_at: string;
};

type RefreshRecord = {
  id: string;
  refreshed_at: string;
  result_status: string;
  actions_completed: string[];
  before_clicks_28d: number | null;
  before_impressions_28d: number | null;
  before_ctr: number | null;
  before_avg_position: number | null;
  after_clicks_28d: number | null;
  after_impressions_28d: number | null;
  after_ctr: number | null;
  after_avg_position: number | null;
  clicks_delta: number | null;
  clicks_delta_pct: number | null;
  result_calculated_at: string | null;
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  healthy:  { color: "#16A34A", bg: "#F0FDF4", label: "Healthy" },
  warning:  { color: "#D97706", bg: "#FFFBEB", label: "Warning" },
  critical: { color: "#DC2626", bg: "#FEF2F2", label: "Critical" },
  dead:     { color: "#6B7280", bg: "#F9FAFB", label: "Dead" },
  new:      { color: "#2563EB", bg: "#EFF6FF", label: "New" },
  unknown:  { color: "#9CA3AF", bg: "#F9FAFB", label: "Unknown" },
};

const SEVERITY_CONFIG: Record<string, { color: string; border: string; emoji: string }> = {
  high:   { color: "#DC2626", border: "border-l-[#DC2626]", emoji: "🔴" },
  medium: { color: "#D97706", border: "border-l-[#D97706]", emoji: "🟡" },
  low:    { color: "#16A34A", border: "border-l-[#16A34A]", emoji: "🟢" },
};

const PRIORITY_CONFIG: Record<string, { emoji: string; label: string }> = {
  urgent:      { emoji: "🔴", label: "Urgent" },
  important:   { emoji: "🟡", label: "Important" },
  nice_to_have: { emoji: "🟢", label: "Nice to have" },
};

const RESULT_CONFIG: Record<string, { color: string; bg: string; icon: typeof TrendingUp; label: string }> = {
  success:   { color: "#16A34A", bg: "#F0FDF4", icon: TrendingUp, label: "Success" },
  partial:   { color: "#D97706", bg: "#FFFBEB", icon: TrendingUp, label: "Partial improvement" },
  no_change: { color: "#6B7280", bg: "#F9FAFB", icon: Minus, label: "No change" },
  declined:  { color: "#DC2626", bg: "#FEF2F2", icon: TrendingDown, label: "Declined" },
};

export default function PageDetailClient({
  page,
  siteDomain,
  latestDiagnosis,
  latestRefresh,
  diagnosesUsed,
  diagnosesLimit,
}: {
  page: PageData;
  siteDomain: string;
  latestDiagnosis: DiagnosisRecord | null;
  latestRefresh: RefreshRecord | null;
  diagnosesUsed: number;
  diagnosesLimit: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState("");
  const [diagnosis, setDiagnosis] = useState<DiagnosisRecord | null>(latestDiagnosis);
  const [refresh, setRefresh] = useState<RefreshRecord | null>(latestRefresh);
  const [expandedActions, setExpandedActions] = useState<Set<number>>(new Set());
  const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set());
  const [showConfettiMsg, setShowConfettiMsg] = useState(false);

  const isNew = page.status === "new";
  const statusCfg = STATUS_CONFIG[page.status] ?? STATUS_CONFIG["unknown"]!;
  const atLimit = diagnosesUsed >= diagnosesLimit;

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#16A34A", "#0D9488", "#2563EB", "#7C3AED"],
    });
  }, []);

  async function handleDiagnose() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: page.id }),
      });

      const json = (await res.json()) as { data?: { diagnosisId: string; diagnosis: DiagnosisData; brief: BriefData; costUsd: number; processingTimeMs: number }; error?: string };

      if (!res.ok) {
        setError(json.error ?? "Diagnosis failed");
        return;
      }

      if (json.data) {
        setDiagnosis({
          id: json.data.diagnosisId,
          diagnosis: json.data.diagnosis,
          refresh_brief: json.data.brief,
          cost_usd: json.data.costUsd,
          processing_time_ms: json.data.processingTimeMs,
          created_at: new Date().toISOString(),
        });
        // Reset refresh state when new diagnosis is run
        setRefresh(null);
        setCheckedActions(new Set());
      }

      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsUpdated() {
    if (!diagnosis) return;
    setRefreshLoading(true);
    setError("");

    const actionsCompleted = diagnosis.refresh_brief
      ? diagnosis.refresh_brief.actions
          .filter((_, i) => checkedActions.has(i))
          .map((a) => a.title)
      : [];

    try {
      const res = await fetch("/api/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: page.id,
          diagnosisId: diagnosis.id,
          actionsCompleted,
        }),
      });

      const json = (await res.json()) as { data?: { refreshId: string; refreshedAt: string }; error?: string };

      if (!res.ok) {
        setError(json.error ?? "Failed to mark as updated");
        return;
      }

      if (json.data) {
        setRefresh({
          id: json.data.refreshId,
          refreshed_at: json.data.refreshedAt,
          result_status: "pending",
          actions_completed: actionsCompleted,
          before_clicks_28d: page.current_clicks_28d,
          before_impressions_28d: page.current_impressions_28d,
          before_ctr: page.current_ctr,
          before_avg_position: page.current_avg_position,
          after_clicks_28d: null,
          after_impressions_28d: null,
          after_ctr: null,
          after_avg_position: null,
          clicks_delta: null,
          clicks_delta_pct: null,
          result_calculated_at: null,
        });
        setShowConfettiMsg(true);
        fireConfetti();
      }

      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setRefreshLoading(false);
    }
  }

  function toggleAction(index: number) {
    setExpandedActions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toggleCheckedAction(index: number) {
    setCheckedActions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  // Calculate days remaining for pending refresh
  const daysRemaining = refresh?.result_status === "pending"
    ? Math.max(0, 28 - Math.floor((Date.now() - new Date(refresh.refreshed_at).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const hasResult = refresh && refresh.result_status && refresh.result_status !== "pending";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to dashboard
      </Link>

      {/* Page header */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}
              >
                {statusCfg.label}
              </span>
              <span className="text-xs text-[#9CA3AF]">{siteDomain}</span>
            </div>
            <h1
              className="text-lg font-semibold text-[#111827] truncate"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              {page.path}
            </h1>
            <a
              href={page.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[#3B82F6] hover:underline mt-1"
            >
              Visit page <ExternalLink size={12} strokeWidth={1.5} />
            </a>
          </div>

          {/* Diagnose button */}
          <button
            onClick={handleDiagnose}
            disabled={loading || atLimit}
            className={`flex items-center gap-2 h-10 px-5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isNew
                ? "bg-[#2563EB] hover:bg-[#1D4ED8]"
                : "bg-[#D97706] hover:bg-[#B45309]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap size={16} strokeWidth={1.5} />
                {diagnosis ? "Run new diagnosis" : isNew ? "Analyze" : "Diagnose"}
              </>
            )}
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-5 gap-4 mt-5 pt-5 border-t border-[#F3F4F6]">
          <div>
            <p className="text-xs text-[#9CA3AF]">Clicks (28d)</p>
            <p className="text-lg font-bold text-[#111827] tabular-nums">{page.current_clicks_28d}</p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF]">Impressions</p>
            <p className="text-lg font-bold text-[#111827] tabular-nums">{page.current_impressions_28d}</p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF]">Avg Position</p>
            <p className="text-lg font-bold text-[#111827] tabular-nums">#{page.current_avg_position.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF]">{isNew ? "Peak" : "Decay"}</p>
            <p className={`text-lg font-bold tabular-nums ${
              page.decay_score >= 30 ? "text-[#DC2626]" :
              page.decay_score >= 15 ? "text-[#D97706]" :
              "text-[#111827]"
            }`}>
              {page.decay_score > 0 ? `${page.decay_score.toFixed(1)}%` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF]">Keyword</p>
            <p className="text-sm font-medium text-[#111827] truncate">
              {page.primary_keyword ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Refresh tracking card */}
      {refresh && !loading && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          {/* Confetti success message */}
          {showConfettiMsg && refresh.result_status === "pending" && (
            <div className="flex items-center gap-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 mb-4">
              <PartyPopper size={20} strokeWidth={1.5} className="text-[#16A34A] flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#16A34A]">Great! We&apos;ll measure your results in 28 days.</p>
                <p className="text-xs text-[#6B7280] mt-0.5">Keep making great content!</p>
              </div>
            </div>
          )}

          {/* Pending state */}
          {refresh.result_status === "pending" && !showConfettiMsg && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                <Timer size={20} strokeWidth={1.5} className="text-[#2563EB]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111827]">Refresh tracked</p>
                <p className="text-xs text-[#6B7280]">
                  Marked as updated on {new Date(refresh.refreshed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {" — "}
                  Measuring... {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
                </p>
              </div>
            </div>
          )}

          {/* Result state */}
          {hasResult && (() => {
            const resultCfg = RESULT_CONFIG[refresh.result_status] ?? RESULT_CONFIG["no_change"]!;
            const ResultIcon = resultCfg.icon;
            return (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: resultCfg.bg }}
                  >
                    <ResultIcon size={20} strokeWidth={1.5} style={{ color: resultCfg.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Refresh Result: {resultCfg.label}</p>
                    <p className="text-xs text-[#6B7280]">
                      Measured on {refresh.result_calculated_at
                        ? new Date(refresh.result_calculated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Before vs After comparison */}
                <div className="grid grid-cols-4 gap-4 bg-[#F9FAFB] rounded-lg p-4">
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Clicks (28d)</p>
                    <p className="text-sm text-[#6B7280]">{refresh.before_clicks_28d ?? 0}</p>
                    <p className="text-sm font-semibold text-[#111827]">{refresh.after_clicks_28d ?? 0}</p>
                    {refresh.clicks_delta_pct !== null && (
                      <p className={`text-xs font-medium mt-0.5 ${
                        refresh.clicks_delta_pct > 0 ? "text-[#16A34A]" :
                        refresh.clicks_delta_pct < 0 ? "text-[#DC2626]" :
                        "text-[#6B7280]"
                      }`}>
                        {refresh.clicks_delta_pct > 0 ? "+" : ""}{refresh.clicks_delta_pct.toFixed(1)}%
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Impressions</p>
                    <p className="text-sm text-[#6B7280]">{refresh.before_impressions_28d ?? 0}</p>
                    <p className="text-sm font-semibold text-[#111827]">{refresh.after_impressions_28d ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">CTR</p>
                    <p className="text-sm text-[#6B7280]">{((refresh.before_ctr ?? 0) * 100).toFixed(1)}%</p>
                    <p className="text-sm font-semibold text-[#111827]">{((refresh.after_ctr ?? 0) * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Avg Position</p>
                    <p className="text-sm text-[#6B7280]">#{(refresh.before_avg_position ?? 0).toFixed(1)}</p>
                    <p className="text-sm font-semibold text-[#111827]">#{(refresh.after_avg_position ?? 0).toFixed(1)}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
          <Loader2 size={32} strokeWidth={1.5} className="text-[#7C3AED] animate-spin mx-auto mb-4" />
          <p className="text-[#111827] font-medium">Analyzing your page...</p>
          <p className="text-sm text-[#6B7280] mt-1">This takes about 20 seconds. Searching Google, fetching competitors, running AI analysis.</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Diagnosis results */}
      {diagnosis && !loading && (
        <>
          {/* Diagnosis card */}
          <div className="bg-white rounded-xl border-2 border-[#7C3AED]/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={18} strokeWidth={1.5} className="text-[#7C3AED]" />
                <h2 className="text-lg font-semibold text-[#111827]">
                  {isNew ? "Content Analysis" : "Decay Diagnosis"}
                </h2>
              </div>
              <span className="text-xs text-[#9CA3AF]">
                {new Date(diagnosis.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {/* Summary */}
            <p className="text-[#4B5563] mb-5">{diagnosis.diagnosis.summary}</p>

            {/* Causes */}
            <div className="space-y-3">
              {diagnosis.diagnosis.causes.map((cause, i) => {
                const sev = SEVERITY_CONFIG[cause.severity] ?? SEVERITY_CONFIG["medium"]!;
                return (
                  <div
                    key={i}
                    className={`border-l-4 ${sev.border} bg-[#F9FAFB] rounded-r-xl p-4`}
                  >
                    <div className="flex items-start gap-2">
                      <span>{sev.emoji}</span>
                      <div>
                        <p className="font-medium text-[#111827]">{cause.title}</p>
                        <p className="text-sm text-[#4B5563] mt-1">{cause.description}</p>
                        <p className="text-xs text-[#6B7280] mt-2 italic">Evidence: {cause.evidence}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SERP Analysis */}
            {diagnosis.diagnosis.serp_analysis && (
              <div className="mt-5 pt-5 border-t border-[#E5E7EB]">
                <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">SERP Insight</p>
                <p className="text-sm text-[#4B5563]">
                  Intent: <span className="font-medium text-[#111827]">{diagnosis.diagnosis.serp_analysis.intent_type}</span>
                  {" · "}
                  Format trend: <span className="font-medium text-[#111827]">{diagnosis.diagnosis.serp_analysis.content_format_trend}</span>
                </p>
              </div>
            )}
          </div>

          {/* Refresh Brief */}
          {diagnosis.refresh_brief && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#111827]">Refresh Brief</h2>
                <span className="text-xs text-[#9CA3AF]">
                  Est. {diagnosis.refresh_brief.total_effort_hours}h total
                </span>
              </div>

              <div className="space-y-3">
                {diagnosis.refresh_brief.actions.map((action, i) => {
                  const pri = PRIORITY_CONFIG[action.priority] ?? PRIORITY_CONFIG["important"]!;
                  const isExpanded = expandedActions.has(i);
                  const isChecked = checkedActions.has(i);

                  return (
                    <div key={i} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                      <div className="flex items-center">
                        {/* Checkbox — only show if no pending/completed refresh */}
                        {!refresh && (
                          <div className="pl-4 flex items-center">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => toggleCheckedAction(i)}
                              className="data-[state=checked]:bg-[#16A34A] data-[state=checked]:border-[#16A34A]"
                            />
                          </div>
                        )}
                        {/* Show check icon for completed actions */}
                        {refresh && refresh.actions_completed.includes(action.title) && (
                          <div className="pl-4 flex items-center">
                            <Check size={16} strokeWidth={2} className="text-[#16A34A]" />
                          </div>
                        )}
                        <button
                          onClick={() => toggleAction(i)}
                          className="flex-1 flex items-center gap-3 p-4 text-left hover:bg-[#F9FAFB] transition-colors"
                        >
                          <span>{pri.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[#111827]">{action.title}</p>
                            <p className="text-xs text-[#9CA3AF] mt-0.5">
                              {pri.label} · {action.effort_minutes}min · {action.category}
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={16} strokeWidth={1.5} className="text-[#9CA3AF]" />
                          ) : (
                            <ChevronDown size={16} strokeWidth={1.5} className="text-[#9CA3AF]" />
                          )}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0 border-t border-[#F3F4F6]">
                          <p className="text-sm text-[#4B5563] mt-3 mb-3">{action.description}</p>

                          {/* Micro-draft */}
                          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-4">
                            <p className="text-xs font-medium text-[#16A34A] uppercase tracking-wider mb-2">
                              Micro-draft: {action.micro_draft.type.replace(/_/g, " ")}
                            </p>
                            <ul className="space-y-2">
                              {action.micro_draft.suggestions.map((s, j) => (
                                <li key={j} className="text-sm text-[#111827] flex gap-2">
                                  <span className="text-[#16A34A] flex-shrink-0">→</span>
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                            {action.micro_draft.competitor_references && action.micro_draft.competitor_references.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-[#BBF7D0]">
                                <p className="text-xs text-[#6B7280]">
                                  References: {action.micro_draft.competitor_references.join(", ")}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mark as Updated button */}
              {!refresh && (
                <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
                  <button
                    onClick={handleMarkAsUpdated}
                    disabled={refreshLoading}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {refreshLoading ? (
                      <>
                        <Loader2 size={18} strokeWidth={1.5} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check size={18} strokeWidth={2} />
                        Mark as Updated
                      </>
                    )}
                  </button>
                  {checkedActions.size > 0 && (
                    <p className="text-xs text-[#6B7280] text-center mt-2">
                      {checkedActions.size} action{checkedActions.size !== 1 ? "s" : ""} completed
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Empty state — no diagnosis yet */}
      {!diagnosis && !loading && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
          <Zap size={32} strokeWidth={1.5} className="text-[#9CA3AF] mx-auto mb-3" />
          <p className="text-[#6B7280]">
            {isNew
              ? "Click \"Analyze\" to get AI-powered content recommendations for this page."
              : "Click \"Diagnose\" to find out why this page is losing traffic."
            }
          </p>
          <p className="text-xs text-[#9CA3AF] mt-2">
            Uses 1 of your {diagnosesLimit} monthly diagnoses ({diagnosesUsed} used). Cost: ~$0.12
          </p>
        </div>
      )}
    </div>
  );
}
