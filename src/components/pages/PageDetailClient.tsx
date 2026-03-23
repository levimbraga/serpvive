"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";
import confetti from "canvas-confetti";
import {
  ArrowLeft, Loader2, Zap, ExternalLink,
  ChevronDown, ChevronUp, Check,
  PartyPopper, Timer, TrendingUp, TrendingDown, Minus,
  BarChart3, Lightbulb, History, ThumbsUp, ThumbsDown,
  Search, FileText, Brain, Sparkles, Info, Copy, ClipboardCheck,
  Download, Pencil, CheckCircle2, Shield, GitMerge,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  formatAnalysisMarkdown,
  formatAnalysisJson,
  buildExportFilename,
} from "@/lib/export/format-analysis";

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
  keyword_source: "clicks" | "impressions" | "title" | "url" | null;
  last_diagnosis_at: string | null;
};

type Cause = {
  title: string;
  description: string;
  severity: string;
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
  strengths?: string[];
  topic_coverage?: TopicCoverage;
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
  keyword_used: string | null;
  keyword_source: string | null;
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
  unknown:    { color: "#9CA3AF", bg: "#F9FAFB", label: "Unknown" },
  redirected: { color: "#9CA3AF", bg: "#F9FAFB", label: "Redirected" },
};

const SEVERITY_CONFIG: Record<string, { color: string; border: string }> = {
  high:   { color: "#DC2626", border: "border-l-[#DC2626]" },
  medium: { color: "#D97706", border: "border-l-[#D97706]" },
  low:    { color: "#16A34A", border: "border-l-[#16A34A]" },
};

const PRIORITY_CONFIG: Record<string, { textColor: string; bg: string; label: string }> = {
  urgent:      { textColor: "text-[#EF4444]", bg: "bg-[rgba(239,68,68,0.1)]", label: "Urgent" },
  important:   { textColor: "text-[#F59E0B]", bg: "bg-[rgba(245,158,11,0.1)]", label: "Important" },
  nice_to_have: { textColor: "text-[#22C55E]", bg: "bg-[rgba(34,197,94,0.1)]", label: "Nice to have" },
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
  previousDiagnoses,
  latestRefresh,
  plan,
  diagnosesUsed,
  diagnosesLimit,
  timeZone,
  isAdmin = false,
  hasFreeDiagnosis = true,
  autoDiagStatus = "pending",
  mergedFrom = null,
  sitePages = [],
}: {
  page: PageData;
  siteDomain: string;
  latestDiagnosis: DiagnosisRecord | null;
  previousDiagnoses: DiagnosisRecord[];
  latestRefresh: RefreshRecord | null;
  plan: string;
  diagnosesUsed: number;
  diagnosesLimit: number;
  timeZone: string;
  isAdmin?: boolean;
  hasFreeDiagnosis?: boolean;
  autoDiagStatus?: string;
  mergedFrom?: { id: string; url: string; path: string; mergedAt: string } | null;
  sitePages?: { id: string; path: string; url: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisRecord | null>(latestDiagnosis);
  const [refresh, setRefresh] = useState<RefreshRecord | null>(latestRefresh);
  const [expandedActions, setExpandedActions] = useState<Set<number>>(new Set());
  const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set());
  const [showConfettiMsg, setShowConfettiMsg] = useState(false);
  const [keywordOverride, setKeywordOverride] = useState("");
  const [showKeywordOverride, setShowKeywordOverride] = useState(false);
  const [expandedEvidence, setExpandedEvidence] = useState<Set<number>>(new Set());
  const [expandedPrevEvidence, setExpandedPrevEvidence] = useState<Set<string>>(new Set());

  // Merge state
  const [mergedDismissed, setMergedDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return localStorage.getItem(`merge_dismissed_${page.id}`) === "1"; } catch { return false; }
  });
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeSearch, setMergeSearch] = useState("");
  const [selectedMergePage, setSelectedMergePage] = useState<{ id: string; path: string; url: string } | null>(null);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeError, setMergeError] = useState("");

  const isNew = page.status === "new";
  const statusCfg = STATUS_CONFIG[page.status] ?? STATUS_CONFIG["unknown"]!;
  const isFree = plan === "free";
  const engineNotReady = isFree && (autoDiagStatus === "pending" || autoDiagStatus === "engine_running" || autoDiagStatus === "diagnosing");
  const atLimit = engineNotReady || (isFree && hasFreeDiagnosis) || (!isFree && diagnosesUsed >= diagnosesLimit);

  function handleExport(format: "md" | "json") {
    if (!diagnosis) return;
    const pageData = {
      url: page.url,
      path: page.path,
      keyword: page.primary_keyword,
      clicks28d: page.current_clicks_28d,
      impressions28d: page.current_impressions_28d,
      position: page.primary_position,
    };
    const content = format === "md"
      ? formatAnalysisMarkdown(pageData, diagnosis.diagnosis, diagnosis.refresh_brief, diagnosis.created_at)
      : formatAnalysisJson(pageData, diagnosis.diagnosis, diagnosis.refresh_brief, diagnosis.created_at);
    const filename = buildExportFilename(page.path, diagnosis.created_at, format);
    const blob = new Blob([content], { type: format === "md" ? "text/markdown" : "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Loading step animation: simulate progress through pipeline stages
  useEffect(() => {
    if (!loading) {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedSeconds(0);
      setLoadingStep(0);
      return;
    }

    setElapsedSeconds(0);
    setLoadingStep(0);

    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    // Simulate pipeline steps — spread visually across ~2-3 min total
    const t1 = setTimeout(() => setLoadingStep(1), 15000);  // SERP fetched (~15s)
    const t2 = setTimeout(() => setLoadingStep(2), 40000);  // Competitors analyzed (~40s)
    const t3 = setTimeout(() => setLoadingStep(3), 80000);  // AI diagnosing (~80s)
    // Step 4 (generating brief) comes after diagnosis returns

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [loading]);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#16A34A", "#3B82F6", "#2563EB", "#7C3AED"],
    });
  }, []);

  async function handleDiagnose() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: page.id,
          ...(keywordOverride.trim() ? { keywordOverride: keywordOverride.trim() } : {}),
        }),
      });

      const json = (await res.json()) as { data?: { diagnosisId: string; diagnosis: DiagnosisData; brief: BriefData; costUsd: number; processingTimeMs: number }; error?: string };

      if (!res.ok) {
        setError(json.error ?? "Diagnosis failed");
        return;
      }

      if (json.data) {
        const usedKeyword = keywordOverride.trim() || page.primary_keyword || null;
        const usedSource = keywordOverride.trim() ? "override" : "gsc";
        setDiagnosis({
          id: json.data.diagnosisId,
          diagnosis: json.data.diagnosis,
          refresh_brief: json.data.brief,
          cost_usd: json.data.costUsd,
          processing_time_ms: json.data.processingTimeMs,
          created_at: new Date().toISOString(),
          keyword_used: usedKeyword,
          keyword_source: usedSource,
        });
        setRefresh(null);
        setCheckedActions(new Set());
        setKeywordOverride("");
        setShowKeywordOverride(false);
        posthog.capture("diagnosis_run", {
          page_url: page.url,
          triggered_by: "manual",
          cost_usd: json.data.costUsd,
          keyword_override: keywordOverride.trim() || undefined,
        });
      }

      router.refresh();
    } catch (err) {
      posthog.captureException(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleFeedback(helpful: boolean) {
    if (!diagnosis || feedbackSent) return;
    setFeedbackSent(true);
    try {
      await fetch("/api/diagnose/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosisId: diagnosis.id,
          feedback: helpful ? "helpful" : "not_helpful",
        }),
      });
      posthog.capture("diagnosis_feedback", {
        diagnosis_id: diagnosis.id,
        feedback: helpful ? "helpful" : "not_helpful",
      });
    } catch {
      // Silent fail for feedback — not critical
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
        posthog.capture("refresh_marked", { page_url: page.url });
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

  async function handleMerge() {
    if (!selectedMergePage) return;
    setMergeLoading(true);
    setMergeError("");

    try {
      const res = await fetch("/api/pages/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPageId: selectedMergePage.id, newPageId: page.id }),
      });

      const json = (await res.json()) as { error?: string };

      if (!res.ok) {
        setMergeError(json.error ?? "Merge failed");
        return;
      }

      posthog.capture("page_merged", { old_page_id: selectedMergePage.id, new_page_id: page.id });
      setShowMergeModal(false);
      setSelectedMergePage(null);
      setMergeSearch("");
      router.refresh();
    } catch {
      setMergeError("Network error");
    } finally {
      setMergeLoading(false);
    }
  }

  const filteredMergePages = sitePages.filter((p) => {
    const q = mergeSearch.toLowerCase();
    return !q || p.path.toLowerCase().includes(q) || p.url.toLowerCase().includes(q);
  });

  // Calculate days remaining for pending refresh
  const daysRemaining = refresh?.result_status === "pending"
    ? Math.max(0, 28 - Math.floor((Date.now() - new Date(refresh.refreshed_at).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const hasResult = refresh && refresh.result_status && refresh.result_status !== "pending";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/pages"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to pages
      </Link>

      {/* Page header */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0 w-full sm:w-auto">
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={page.status} />
              <span className="text-xs text-[#9CA3AF]">{siteDomain}</span>
            </div>
            <h1
              className="text-xl font-semibold text-[#111827] truncate max-w-full"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
              title={page.url}
            >
              {page.path}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <a
                href={page.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[#3B82F6] hover:underline"
              >
                Visit page <ExternalLink size={12} strokeWidth={1.5} />
              </a>
              {page.status !== "redirected" && sitePages.length > 0 && (
                <button
                  onClick={() => setShowMergeModal(true)}
                  className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                  <GitMerge size={12} strokeWidth={1.5} />
                  Merge history
                </button>
              )}
            </div>
          </div>

          {/* Diagnose button + test button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDiagnose}
              disabled={loading || atLimit}
              className={`flex items-center gap-2 h-10 px-5 rounded-lg text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[#F3F4F6]">
          <div>
            <p className="text-[13px] text-[#9CA3AF]">Clicks (28d)</p>
            <p className="text-[28px] font-bold text-[#111827] tabular-nums">{page.current_clicks_28d}</p>
          </div>
          <div>
            <p className="text-[13px] text-[#9CA3AF]">Impressions</p>
            <p className="text-[28px] font-bold text-[#111827] tabular-nums">{page.current_impressions_28d}</p>
          </div>
          <div>
            <p className="text-[13px] text-[#9CA3AF]">Avg Position</p>
            <p className="text-[28px] font-bold text-[#111827] tabular-nums">#{page.current_avg_position.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-[13px] text-[#9CA3AF]">{isNew ? "Peak" : "Decay"}</p>
            <p className={`text-[28px] font-bold tabular-nums ${
              page.decay_score >= 30 ? "text-[#DC2626]" :
              page.decay_score >= 15 ? "text-[#D97706]" :
              "text-[#111827]"
            }`}>
              {page.decay_score > 0 ? `${page.decay_score.toFixed(1)}%` : "—"}
            </p>
          </div>
        </div>

        {/* Merged-from note */}
        {mergedFrom && !mergedDismissed && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <Info size={11} strokeWidth={1.5} className="flex-shrink-0" />
            <span>
              Merged from{" "}
              <span style={{ fontFamily: "var(--font-mono, monospace)" }}>{mergedFrom.path}</span>
              {" "}&middot;{" "}
              {new Date(mergedFrom.mergedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone })}
            </span>
            <button
              onClick={() => { setMergedDismissed(true); try { localStorage.setItem(`merge_dismissed_${page.id}`, "1"); } catch {} }}
              className="ml-1 text-[#D1D5DB] hover:text-[#9CA3AF] transition-colors"
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
        )}

        {/* Redirected banner */}
        {page.status === "redirected" && (page as PageData & { redirect_to?: string }).redirect_to && (
          <div className="mt-3 flex items-center gap-2 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-3 py-2">
            <Info size={14} strokeWidth={1.5} className="text-[#D97706] flex-shrink-0" />
            <p className="text-xs text-[#92400E]">
              This page was merged into another URL. Its diagnoses and refresh history were transferred.
            </p>
          </div>
        )}

        {/* GSC data lag disclaimer */}
        <p className="text-[10px] text-[#D1D5DB] mt-3 flex items-center gap-1">
          <Info size={10} strokeWidth={1.5} />
          Data from Google Search Console (2–3 day delay)
        </p>

        {/* Keyword + override */}
        {page.primary_keyword && (
          <div className="mt-3">
            <p className="text-xs text-[#9CA3AF] mb-0.5">Keyword</p>
            <p className="text-sm font-medium text-[#111827]">
              {page.primary_keyword}
              {page.keyword_source && page.keyword_source !== "clicks" && (
                <span className="text-xs font-normal text-[#9CA3AF] ml-1">
                  ({page.keyword_source === "impressions" ? "by impressions" : "estimated"})
                </span>
              )}
            </p>
            {!showKeywordOverride ? (
              <button
                onClick={() => setShowKeywordOverride(true)}
                className="flex items-center gap-1 mt-1.5 text-xs text-[#6B7280] hover:text-[#3B82F6] transition-colors"
              >
                <Pencil size={11} strokeWidth={1.5} /> Use a different keyword
              </button>
            ) : (
              <div className="mt-2 space-y-2">
                <label className="block text-xs text-[#6B7280]">
                  Target a different keyword (optional)
                </label>
                <input
                  type="text"
                  value={keywordOverride}
                  onChange={(e) => setKeywordOverride(e.target.value)}
                  placeholder="e.g. hen and chicks succulent guide"
                  className="w-full h-8 px-2.5 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                />
                <p className="text-[10px] text-[#9CA3AF] flex items-center gap-1">
                  <Info size={10} strokeWidth={1.5} />
                  The analysis will use this keyword instead of the one from GSC. Leave empty to use the default.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowKeywordOverride(false)}
                    className="h-7 px-3 rounded-md text-xs font-medium text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Refresh tracking card */}
      {refresh && !loading && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          {/* Confetti success message */}
          {showConfettiMsg && refresh.result_status === "pending" && (
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-4">
                <PartyPopper size={20} strokeWidth={1.5} className="text-[#16A34A] flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#16A34A]">Great! We&apos;ll measure your results in 28 days.</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">Keep making great content!</p>
                </div>
              </div>

              {/* Post-refresh info tip */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <BarChart3 size={18} strokeWidth={1.5} className="text-[#2563EB] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-[#1E40AF] leading-relaxed">
                    <p>Results will be automatically measured in 28 days. We&apos;ll compare your before and after metrics to prove what worked.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 mt-3">
                  <Lightbulb size={18} strokeWidth={1.5} className="text-[#D97706] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-[#92400E] leading-relaxed">
                    <p><span className="font-medium">Tip:</span> You can run a new analysis right now to see how your updated content compares against competitors. The diagnosis reads your live content — so if your changes are published, the new analysis will reflect them.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pending state */}
          {refresh.result_status === "pending" && !showConfettiMsg && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                  <Timer size={20} strokeWidth={1.5} className="text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">Refresh tracked</p>
                  <p className="text-xs text-[#6B7280]">
                    Marked as updated on {new Date(refresh.refreshed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone })}
                    {" — "}
                    Measuring... {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
                  </p>
                </div>
              </div>

              {/* Refresh flow tip */}
              <p className="text-[13px] text-[#6B7280] leading-relaxed">
                Want to see how your changes stack up?{" "}
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors"
                >
                  Run a new analysis &rarr;
                </button>
                {" "}It will read your updated content and compare it fresh against today&apos;s top competitors.
              </p>
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
                        ? new Date(refresh.result_calculated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone })
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Before vs After comparison */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F9FAFB] rounded-lg p-4">
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

      {/* Loading state — step-by-step progress */}
      {loading && (
        <div className="bg-white rounded-lg border-2 border-[#7C3AED]/20 p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[#111827] font-semibold">Analyzing your page...</p>
            <span className="text-xs text-[#9CA3AF] tabular-nums">
              {Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, "0")} elapsed
            </span>
          </div>

          <div className="space-y-3">
            {[
              { icon: Search, label: "Fetching SERP data...", step: 0 },
              { icon: FileText, label: "Analyzing competitor content...", step: 1 },
              { icon: Brain, label: "AI is diagnosing your page...", step: 2 },
              { icon: Sparkles, label: "Generating refresh brief...", step: 3 },
            ].map(({ icon: Icon, label, step: s }) => {
              const isDone = loadingStep > s;
              const isActive = loadingStep === s;
              return (
                <div key={s} className="flex items-center gap-3">
                  {isDone ? (
                    <div className="w-6 h-6 rounded-full bg-[#F0FDF4] flex items-center justify-center flex-shrink-0">
                      <Check size={14} strokeWidth={2} className="text-[#16A34A]" />
                    </div>
                  ) : isActive ? (
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      <Loader2 size={16} strokeWidth={2} className="text-[#7C3AED] animate-spin" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                      <Icon size={12} strokeWidth={1.5} className="text-[#9CA3AF]" />
                    </div>
                  )}
                  <span className={`text-sm ${isDone ? "text-[#16A34A]" : isActive ? "text-[#111827] font-medium" : "text-[#9CA3AF]"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-[#9CA3AF] mt-4">
            Usually takes 2–3 minutes. You can navigate away — the result will be saved automatically.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Diagnosis results */}
      {diagnosis && !loading && (
        <>
          {/* Diagnosis card */}
          <div className="bg-white rounded-lg border-2 border-[#7C3AED]/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={18} strokeWidth={1.5} className="text-[#7C3AED]" />
                <h2 className="text-lg font-semibold text-[#111827]">
                  {isNew ? "Content Analysis" : "Decay Diagnosis"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-[#E5E7EB] text-xs font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors">
                      <Download size={12} strokeWidth={1.5} /> Export
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExport("md")}>
                        Export as Markdown
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("json")}>
                        Export as JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <span className="text-xs text-[#9CA3AF]">
                  {new Date(diagnosis.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone })}
                </span>
              </div>
            </div>

            {/* Keyword used */}
            {diagnosis.keyword_used && (
              <p className="text-xs text-[#6B7280] mb-3">
                Analyzed for: <span className="font-medium text-[#111827]">{diagnosis.keyword_used}</span>
                <span className="text-[#9CA3AF] ml-1">
                  ({diagnosis.keyword_source === "override" ? "custom" : diagnosis.keyword_source === "estimated" ? "estimated" : "from GSC"})
                </span>
              </p>
            )}

            {/* Summary */}
            <p className="text-[#4B5563] mb-4">{diagnosis.diagnosis.summary}</p>

            {/* Topic Coverage */}
            {diagnosis.diagnosis.topic_coverage && (
              <div className="bg-[#F9FAFB] rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Topic Coverage</h3>
                  <span className="text-sm font-semibold text-[#111827]">
                    {diagnosis.diagnosis.topic_coverage.covered} / {diagnosis.diagnosis.topic_coverage.total} ({diagnosis.diagnosis.topic_coverage.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(diagnosis.diagnosis.topic_coverage.percentage, 100)}%`,
                      backgroundColor: diagnosis.diagnosis.topic_coverage.percentage >= 80 ? "#16A34A" : diagnosis.diagnosis.topic_coverage.percentage >= 50 ? "#D97706" : "#DC2626",
                    }}
                  />
                </div>
                {diagnosis.diagnosis.topic_coverage.missing.length > 0 && (
                  <p className="text-xs text-[#6B7280] mt-2">
                    <span className="font-medium text-[#374151]">Missing:</span>{" "}
                    {diagnosis.diagnosis.topic_coverage.missing.join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Comparison badge */}
            {previousDiagnoses.length > 0 && (() => {
              const prevCauses = previousDiagnoses[0]!.diagnosis.causes.length;
              const currCauses = diagnosis.diagnosis.causes.length;
              const prevDate = new Date(previousDiagnoses[0]!.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone });
              const improved = currCauses < prevCauses;
              const worsened = currCauses > prevCauses;
              return (
                <div className={`flex items-start gap-2 rounded-lg px-4 py-3 mb-5 text-sm ${
                  improved ? "bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534]"
                  : worsened ? "bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E]"
                  : "bg-[#F9FAFB] border border-[#E5E7EB] text-[#4B5563]"
                }`}>
                  <span className="flex-shrink-0">{improved ? "📈" : worsened ? "⚠️" : "📊"}</span>
                  <span>
                    Compared to your last analysis ({prevDate}): Previously {prevCauses} cause{prevCauses !== 1 ? "s" : ""} identified, now {currCauses}
                    {improved && " — your updates are working!"}
                    {worsened && " — new competitors may have appeared."}
                    {!improved && !worsened && " — same number of issues."}
                  </span>
                </div>
              );
            })()}

            {/* Healthy page — no causes */}
            {diagnosis.diagnosis.causes.length === 0 && (
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={22} strokeWidth={1.5} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-[#166534]">Your page is in great shape!</h3>
                    <p className="text-sm text-[#15803D] leading-relaxed">
                      We analyzed your content against the top 10 SERP results and found no critical issues. Your page is well-optimized for &ldquo;{diagnosis.keyword_used ?? page.primary_keyword ?? "this keyword"}&rdquo;.
                    </p>

                    {/* Strengths — proof of analysis */}
                    {diagnosis.diagnosis.strengths && diagnosis.diagnosis.strengths.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-[#166534] uppercase tracking-wider mb-2">What you&apos;re doing right</p>
                        <ul className="space-y-1.5">
                          {diagnosis.diagnosis.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-[#15803D] flex gap-2">
                              <span className="text-[#16A34A] flex-shrink-0">✓</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {diagnosis.diagnosis.topic_coverage && (
                      <p className="text-sm text-[#15803D]">
                        Topic Coverage: {diagnosis.diagnosis.topic_coverage.covered} / {diagnosis.diagnosis.topic_coverage.total} ({diagnosis.diagnosis.topic_coverage.percentage}%)
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
            {diagnosis.diagnosis.causes.length > 0 && diagnosis.diagnosis.strengths && diagnosis.diagnosis.strengths.length > 0 && (
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-4 mb-1">
                <p className="text-xs font-semibold text-[#166534] uppercase tracking-wider mb-2">What you&apos;re doing right</p>
                <ul className="space-y-1.5">
                  {diagnosis.diagnosis.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-[#15803D] flex gap-2">
                      <span className="text-[#16A34A] flex-shrink-0">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Single low-severity cause — healthy header */}
            {diagnosis.diagnosis.causes.length === 1 && diagnosis.diagnosis.causes[0]?.severity === "low" && (
              <div className="flex items-center gap-2 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-4 py-3 mb-1">
                <CheckCircle2 size={16} strokeWidth={1.5} className="text-[#16A34A] flex-shrink-0" />
                <p className="text-sm text-[#166534]">
                  Your page is performing well. We found 1 optional improvement:
                </p>
              </div>
            )}

            {/* Causes */}
            {diagnosis.diagnosis.causes.length > 0 && (
            <div className="space-y-3">
              {diagnosis.diagnosis.causes.map((cause, i) => {
                const sev = SEVERITY_CONFIG[cause.severity] ?? SEVERITY_CONFIG["medium"]!;
                return (
                  <div
                    key={i}
                    className={`border-l-4 ${sev.border} bg-[#F9FAFB] rounded-r-xl p-4`}
                  >
                    <div>
                      <p className="font-medium text-[#111827]">{cause.title}</p>
                      <p className="text-sm text-[#4B5563] mt-1">{cause.description}</p>
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
                  </div>
                );
              })}
            </div>
            )}

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

            {/* Feedback */}
            <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
              {feedbackSent ? (
                <p className="text-xs text-[#16A34A]">Thanks for your feedback!</p>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-xs text-[#9CA3AF]">Was this diagnosis helpful?</p>
                  <button
                    onClick={() => handleFeedback(true)}
                    className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#16A34A] transition-colors px-2 py-1 rounded-md hover:bg-[#F0FDF4]"
                  >
                    <ThumbsUp size={12} strokeWidth={1.5} /> Yes
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#DC2626] transition-colors px-2 py-1 rounded-md hover:bg-[#FEF2F2]"
                  >
                    <ThumbsDown size={12} strokeWidth={1.5} /> No
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Refresh Brief — empty (healthy page) */}
          {diagnosis.refresh_brief && diagnosis.refresh_brief.actions.length === 0 && (
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
              <h2 className="text-lg font-semibold text-[#111827] mb-3">Refresh Brief</h2>
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

          {/* Refresh Brief */}
          {diagnosis.refresh_brief && diagnosis.refresh_brief.actions.length > 0 && (
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
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
                    <div key={i} className="border border-[#E5E7EB] rounded-lg overflow-hidden">
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
                          <span className={`text-[11px] font-medium ${pri.textColor} ${pri.bg} px-2 py-0.5 rounded-full flex-shrink-0`}>
                            {pri.label}
                          </span>
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
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-[#16A34A] uppercase tracking-wider">
                                Micro-draft: {action.micro_draft.type.replace(/_/g, " ")}
                              </p>
                              <CopyMicroDraftButton suggestions={action.micro_draft.suggestions} />
                            </div>
                            <ul className="space-y-3">
                              {action.micro_draft.suggestions.map((s, j) => (
                                <li key={j} className="text-sm text-[#111827] flex gap-2">
                                  <span className="text-[#16A34A] flex-shrink-0 mt-0.5">→</span>
                                  <div className="flex-1 space-y-1.5">
                                    {s.split(/\n+/).map((paragraph, k) => (
                                      <p key={k} className="leading-relaxed">{paragraph}</p>
                                    ))}
                                  </div>
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
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Previous Analyses — only show if there's history */}
      {previousDiagnoses.length > 0 && !loading && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <History size={18} strokeWidth={1.5} className="text-[#9CA3AF]" />
            <h2 className="text-lg font-semibold text-[#111827]">Previous Analyses</h2>
            <span className="text-xs text-[#9CA3AF]">
              {previousDiagnoses.length} previous{previousDiagnoses.length > 10 ? " (showing last 10)" : ""}
            </span>
          </div>

          <Accordion>
            {previousDiagnoses.map((prev) => {
              const summaryPreview = prev.diagnosis.summary.length > 150
                ? prev.diagnosis.summary.slice(0, 150) + "..."
                : prev.diagnosis.summary;
              const causesCount = prev.diagnosis.causes.length;
              const actionsCount = prev.refresh_brief?.actions.length ?? 0;
              const effort = prev.refresh_brief?.total_effort_hours ?? 0;

              return (
                <AccordionItem key={prev.id} className="bg-white rounded-lg border border-[#E5E7EB] mb-2 overflow-hidden">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-[#F9FAFB]">
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-[#111827]">
                        Analysis from {new Date(prev.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone })}
                      </p>
                      <p className="text-sm text-[#6B7280] mt-1 line-clamp-1">
                        &ldquo;{summaryPreview}&rdquo;
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-1.5">
                        {prev.keyword_used && (
                          <>
                            keyword: {prev.keyword_used}
                            {prev.keyword_source === "override" && " (custom)"}
                            {" · "}
                          </>
                        )}
                        {causesCount} cause{causesCount !== 1 ? "s" : ""}
                        {actionsCount > 0 && ` · ${actionsCount} action${actionsCount !== 1 ? "s" : ""}`}
                        {effort > 0 && ` · Est. ${effort}h total`}
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5">
                    <div className="space-y-4 pt-2">
                      {/* Diagnosis */}
                      <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap size={16} strokeWidth={1.5} className="text-[#7C3AED]" />
                          <p className="text-sm font-semibold text-[#111827]">
                            {page.status === "new" ? "Content Analysis" : "Decay Diagnosis"}
                          </p>
                        </div>
                        <p className="text-sm text-[#4B5563] mb-4">{prev.diagnosis.summary}</p>
                        <div className="space-y-2">
                          {prev.diagnosis.causes.map((cause, i) => {
                            const sev = SEVERITY_CONFIG[cause.severity] ?? SEVERITY_CONFIG["medium"]!;
                            return (
                              <div key={i} className={`border-l-4 ${sev.border} bg-white rounded-r-lg p-3`}>
                                <div>
                                  <p className="text-sm font-medium text-[#111827]">{cause.title}</p>
                                  <p className="text-xs text-[#4B5563] mt-1">{cause.description}</p>
                                  <button
                                    onClick={() => setExpandedPrevEvidence(prevSet => {
                                      const key = `${prev.id}-${i}`;
                                      const next = new Set(prevSet);
                                      next.has(key) ? next.delete(key) : next.add(key);
                                      return next;
                                    })}
                                    className="flex items-center gap-1 mt-1.5 text-xs text-[#6B7280] hover:text-[#4B5563] transition-colors"
                                  >
                                    {expandedPrevEvidence.has(`${prev.id}-${i}`) ? "Hide evidence" : "Show evidence"}
                                    <ChevronDown size={12} strokeWidth={1.5} className={`transition-transform duration-150 ${expandedPrevEvidence.has(`${prev.id}-${i}`) ? "rotate-180" : ""}`} />
                                  </button>
                                  {expandedPrevEvidence.has(`${prev.id}-${i}`) && (
                                    <p className="text-xs text-[#6B7280] mt-1.5 italic leading-relaxed bg-[#F9FAFB] rounded-md p-3">
                                      {cause.evidence}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {prev.diagnosis.serp_analysis && (
                          <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
                            <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1">SERP Insight</p>
                            <p className="text-xs text-[#4B5563]">
                              Intent: <span className="font-medium text-[#111827]">{prev.diagnosis.serp_analysis.intent_type}</span>
                              {" · "}
                              Format: <span className="font-medium text-[#111827]">{prev.diagnosis.serp_analysis.content_format_trend}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Brief */}
                      {prev.refresh_brief && (
                        <ReadOnlyBriefCard brief={prev.refresh_brief} />
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}

      {/* Empty state — no diagnosis yet */}
      {!diagnosis && !loading && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 text-center">
          <Zap size={32} strokeWidth={1.5} className="text-[#9CA3AF] mx-auto mb-3" />
          <p className="text-[#6B7280]">
            {isNew
              ? "Click \"Analyze\" to get AI-powered content recommendations for this page."
              : "Click \"Diagnose\" to find out why this page is losing traffic."
            }
          </p>
          <p className="text-xs text-[#9CA3AF] mt-2">
            {isFree
              ? engineNotReady
                ? "Run the Decay Engine first to unlock AI diagnosis."
                : hasFreeDiagnosis
                  ? "Upgrade to a paid plan to run more AI diagnoses."
                  : "This will use your 1 free diagnosis."
              : `Uses 1 of your ${diagnosesLimit} monthly diagnoses (${diagnosesUsed} used)`
            }
          </p>
        </div>
      )}

      {/* Merge modal */}
      <Dialog open={showMergeModal} onOpenChange={(open) => { if (!open) { setShowMergeModal(false); setSelectedMergePage(null); setMergeSearch(""); setMergeError(""); } }}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge size={18} strokeWidth={1.5} className="text-[#3B82F6]" />
              Merge Page History
            </DialogTitle>
            <DialogDescription>
              Select the old page (previous URL) to merge into this one. Diagnoses and refresh history will be transferred here. The old page will be archived.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-hidden">
            {/* Current page (new URL) */}
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded">New</span>
                <span className="text-xs text-[#6B7280]">This page (will receive history)</span>
              </div>
              <p className="text-sm font-medium text-[#111827] truncate" style={{ fontFamily: "var(--font-mono, monospace)" }} title={page.url}>
                {page.path}
              </p>
            </div>

            {/* Select old page */}
            <div>
              <p className="text-xs font-medium text-[#6B7280] mb-2">Select the old page:</p>
              <input
                type="text"
                value={mergeSearch}
                onChange={(e) => setMergeSearch(e.target.value)}
                placeholder="Search pages by path or URL..."
                className="h-9 w-full px-3 text-sm text-[#111827] border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent mb-2"
              />
              <div className="max-h-48 overflow-hidden overflow-y-auto border border-[#E5E7EB] rounded-lg divide-y divide-[#F3F4F6]">
                {filteredMergePages.length === 0 ? (
                  <p className="text-sm text-[#9CA3AF] text-center py-4">No matching pages</p>
                ) : (
                  filteredMergePages.slice(0, 20).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedMergePage(p)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[#F9FAFB] transition-colors overflow-hidden ${
                        selectedMergePage?.id === p.id ? "bg-[#EFF6FF] border-l-2 border-l-[#3B82F6]" : ""
                      }`}
                    >
                      <span className="font-medium text-[#111827] block truncate max-w-full" style={{ fontFamily: "var(--font-mono, monospace)" }} title={p.path}>
                        {p.path}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Merge preview */}
            {selectedMergePage && (
              <div className="border border-[#E5E7EB] rounded-lg p-3 space-y-3 overflow-hidden">
                <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded">Old</span>
                    <span className="text-[10px] text-[#9CA3AF]">Will be archived</span>
                  </div>
                  <p className="text-sm text-[#111827] truncate" style={{ fontFamily: "var(--font-mono, monospace)" }} title={selectedMergePage.url}>
                    {selectedMergePage.path}
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                    <span>↓</span>
                    <span>merge into</span>
                    <span>↓</span>
                  </div>
                </div>
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded">New</span>
                    <span className="text-[10px] text-[#9CA3AF]">Will receive history</span>
                  </div>
                  <p className="text-sm font-medium text-[#111827] truncate" style={{ fontFamily: "var(--font-mono, monospace)" }} title={page.url}>
                    {page.path}
                  </p>
                </div>
                <p className="text-[11px] text-[#9CA3AF] text-center">
                  This cannot be easily undone.
                </p>
              </div>
            )}

            {mergeError && (
              <p className="text-sm text-[#DC2626]">{mergeError}</p>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => { setShowMergeModal(false); setSelectedMergePage(null); setMergeSearch(""); setMergeError(""); }}
              disabled={mergeLoading}
              className="h-9 px-4 rounded-lg border border-[#E5E7EB] text-sm text-[#111827] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleMerge}
              disabled={mergeLoading || !selectedMergePage}
              className="h-9 px-4 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {mergeLoading ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : <GitMerge size={14} strokeWidth={1.5} />}
              Merge Pages
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Read-only brief card for previous diagnoses (no checkboxes, no mark-as-updated).
 */
function ReadOnlyBriefCard({ brief }: { brief: BriefData }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#111827]">Refresh Brief</h2>
        <span className="text-xs text-[#9CA3AF]">
          Est. {brief.total_effort_hours}h total
        </span>
      </div>

      <div className="space-y-3">
        {brief.actions.map((action, i) => {
          const pri = PRIORITY_CONFIG[action.priority] ?? PRIORITY_CONFIG["important"]!;
          const isExpanded = expanded.has(i);

          return (
            <div key={i} className="border border-[#E5E7EB] rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  setExpanded((prev) => {
                    const next = new Set(prev);
                    if (next.has(i)) next.delete(i);
                    else next.add(i);
                    return next;
                  });
                }}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#F9FAFB] transition-colors"
              >
                <span className={`text-[11px] font-medium ${pri.textColor} ${pri.bg} px-2 py-0.5 rounded-full flex-shrink-0`}>
                  {pri.label}
                </span>
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

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-[#F3F4F6]">
                  <p className="text-sm text-[#4B5563] mt-3 mb-3">{action.description}</p>

                  <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-[#16A34A] uppercase tracking-wider">
                        Micro-draft: {action.micro_draft.type.replace(/_/g, " ")}
                      </p>
                      <CopyMicroDraftButton suggestions={action.micro_draft.suggestions} />
                    </div>
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
    </div>
  );
}

function CopyMicroDraftButton({ suggestions }: { suggestions: string[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = suggestions.map((s) => `• ${s}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs text-[#16A34A] hover:text-[#15803D] transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <ClipboardCheck size={13} strokeWidth={1.5} />
          Copied
        </>
      ) : (
        <>
          <Copy size={13} strokeWidth={1.5} />
          Copy
        </>
      )}
    </button>
  );
}
