"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";
import confetti from "canvas-confetti";
import {
  ArrowLeft, Loader2, Zap, ExternalLink,
  ChevronDown, ChevronUp, Check,
  PartyPopper, Timer, TrendingUp, TrendingDown, Minus,
  FlaskConical, Download, X as XIcon,
  BarChart3, Lightbulb, History,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

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

const ADMIN_EMAIL = "levimaiabraga@gmail.com";

type TestResultItem = {
  version: string;
  name: string;
  diagnosis?: DiagnosisData;
  brief?: BriefData;
  error?: string;
  duration_ms: number;
  tokens: { input: number; output: number };
  cost_usd: number;
};

type TestResponse = {
  data: {
    results: TestResultItem[];
    summary: {
      total_cost_usd: number;
      total_duration_ms: number;
      versions_run: number;
      versions_succeeded: number;
      versions_failed: number;
    };
  };
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
  previousDiagnoses,
  latestRefresh,
  plan,
  diagnosesUsed,
  diagnosesLimit,
  userEmail,
}: {
  page: PageData;
  siteDomain: string;
  latestDiagnosis: DiagnosisRecord | null;
  previousDiagnoses: DiagnosisRecord[];
  latestRefresh: RefreshRecord | null;
  plan: string;
  diagnosesUsed: number;
  diagnosesLimit: number;
  userEmail?: string;
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

  // Prompt test state (admin only)
  const [testResults, setTestResults] = useState<TestResultItem[] | null>(null);
  const [testSummary, setTestSummary] = useState<TestResponse["data"]["summary"] | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState("");
  const isAdmin = userEmail === ADMIN_EMAIL;

  const isNew = page.status === "new";
  const statusCfg = STATUS_CONFIG[page.status] ?? STATUS_CONFIG["unknown"]!;
  const isFree = plan === "free";
  const atLimit = isFree || diagnosesUsed >= diagnosesLimit;

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
        setRefresh(null);
        setCheckedActions(new Set());
        posthog.capture("diagnosis_run", {
          page_url: page.url,
          triggered_by: "manual",
          cost_usd: json.data.costUsd,
        });
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

  async function handleRunPromptTest() {
    setTestLoading(true);
    setTestError("");
    setTestResults(null);
    setTestSummary(null);

    try {
      const res = await fetch("/api/test-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_id: page.id, versions: ["v1", "v2", "v3", "v4", "v5"] }),
      });

      const json = (await res.json()) as TestResponse & { error?: string };

      if (!res.ok) {
        setTestError(json.error ?? "Test failed");
        return;
      }

      setTestResults(json.data.results);
      setTestSummary(json.data.summary);
    } catch {
      setTestError("Network error");
    } finally {
      setTestLoading(false);
    }
  }

  function handleExportTestJson() {
    if (!testResults) return;
    const blob = new Blob([JSON.stringify({ results: testResults, summary: testSummary }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-test-${page.path.replace(/\//g, "_")}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="min-w-0 w-full sm:w-auto">
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

          {/* Diagnose button + test button */}
          <div className="flex items-center gap-2 flex-shrink-0">
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

            {isAdmin && (
              <button
                onClick={handleRunPromptTest}
                disabled={testLoading || loading}
                className="flex items-center gap-2 h-10 px-4 rounded-xl border-2 border-[#7C3AED]/30 text-[#7C3AED] text-sm font-medium hover:bg-[#F5F3FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testLoading ? (
                  <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                ) : (
                  <FlaskConical size={16} strokeWidth={1.5} />
                )}
                {testLoading ? "Running..." : "Test 5 Prompts"}
              </button>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[#F3F4F6]">
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
        </div>

        {/* Keyword — full width so long keywords can wrap */}
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
          </div>
        )}
      </div>

      {/* Refresh tracking card */}
      {refresh && !loading && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          {/* Confetti success message */}
          {showConfettiMsg && refresh.result_status === "pending" && (
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4">
                <PartyPopper size={20} strokeWidth={1.5} className="text-[#16A34A] flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#16A34A]">Great! We&apos;ll measure your results in 28 days.</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">Keep making great content!</p>
                </div>
              </div>

              {/* Post-refresh info tip */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4">
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
                    Marked as updated on {new Date(refresh.refreshed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
                  className="text-[#0D9488] hover:text-[#0F766E] font-medium transition-colors"
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
                        ? new Date(refresh.result_calculated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
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

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
          <Loader2 size={32} strokeWidth={1.5} className="text-[#7C3AED] animate-spin mx-auto mb-4" />
          <p className="text-[#111827] font-medium">Analyzing your page...</p>
          <p className="text-sm text-[#6B7280] mt-1">This usually takes about 2 minutes. Searching Google, fetching competitors, running AI analysis.</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Test error */}
      {testError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          Test error: {testError}
        </div>
      )}

      {/* Test loading state */}
      {testLoading && (
        <div className="bg-[#F5F3FF] border-2 border-[#7C3AED]/30 rounded-xl p-8 text-center">
          <Loader2 size={32} strokeWidth={1.5} className="text-[#7C3AED] animate-spin mx-auto mb-4" />
          <p className="text-[#5B21B6] font-medium">Running 5 AI analyses in parallel...</p>
          <p className="text-sm text-[#7C3AED] mt-1">This takes about 5 minutes. Fetching SERP data, running all prompt versions, validating outputs.</p>
        </div>
      )}

      {/* Prompt test results (tabs) */}
      {testResults && !testLoading && (
        <div className="space-y-4">
          {/* Test header */}
          <div className="bg-[#F5F3FF] border-2 border-[#7C3AED]/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FlaskConical size={20} strokeWidth={1.5} className="text-[#7C3AED]" />
                <div>
                  <p className="text-sm font-semibold text-[#5B21B6]">
                    Comparing {testSummary?.versions_run ?? 5} prompt versions
                  </p>
                  <p className="text-xs text-[#7C3AED] mt-0.5">
                    Total: ${testSummary?.total_cost_usd.toFixed(4) ?? "—"} · {Math.round((testSummary?.total_duration_ms ?? 0) / 1000)}s
                    {testSummary?.versions_failed ? ` · ${testSummary.versions_failed} failed` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportTestJson}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#7C3AED]/30 text-xs font-medium text-[#7C3AED] hover:bg-[#EDE9FE] transition-colors"
                >
                  <Download size={12} strokeWidth={1.5} />
                  Export JSON
                </button>
                <button
                  onClick={() => { setTestResults(null); setTestSummary(null); }}
                  className="flex items-center gap-1 h-8 px-3 rounded-lg border border-[#E5E7EB] text-xs text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
                >
                  <XIcon size={12} strokeWidth={1.5} />
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue={testResults[0]?.version ?? "v1"}>
            <TabsList className="w-full flex overflow-x-auto">
              {testResults.map((r) => (
                <TabsTrigger
                  key={r.version}
                  value={r.version}
                  className="flex-1 min-w-0 text-xs sm:text-sm"
                >
                  <span className="truncate">
                    {r.version}: {r.name.split(" ")[0]}
                  </span>
                  {r.error && <span className="ml-1 text-red-500">!</span>}
                </TabsTrigger>
              ))}
            </TabsList>

            {testResults.map((r) => (
              <TabsContent key={r.version} value={r.version} className="space-y-4 mt-4">
                {/* Version info bar */}
                <div className="flex items-center gap-4 text-xs text-[#6B7280] bg-[#F9FAFB] rounded-lg px-4 py-2">
                  <span className="font-medium text-[#111827]">{r.name}</span>
                  <span>${r.cost_usd.toFixed(4)}</span>
                  <span>{Math.round(r.duration_ms / 1000)}s</span>
                  <span>{(r.tokens.input + r.tokens.output).toLocaleString()} tokens</span>
                </div>

                {r.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    Error: {r.error}
                  </div>
                ) : (
                  <>
                    {/* Reuse exact same diagnosis card rendering */}
                    {r.diagnosis && (
                      <div className="bg-white rounded-xl border-2 border-[#7C3AED]/30 p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Zap size={18} strokeWidth={1.5} className="text-[#7C3AED]" />
                          <h2 className="text-lg font-semibold text-[#111827]">
                            {isNew ? "Content Analysis" : "Decay Diagnosis"}
                          </h2>
                          <span className="text-xs text-[#9CA3AF] ml-auto">{r.version}</span>
                        </div>

                        <p className="text-[#4B5563] mb-5">{r.diagnosis.summary}</p>

                        <div className="space-y-3">
                          {r.diagnosis.causes.map((cause, i) => {
                            const sev = SEVERITY_CONFIG[cause.severity] ?? SEVERITY_CONFIG["medium"]!;
                            return (
                              <div key={i} className={`border-l-4 ${sev.border} bg-[#F9FAFB] rounded-r-xl p-4`}>
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

                        {r.diagnosis.serp_analysis && (
                          <div className="mt-5 pt-5 border-t border-[#E5E7EB]">
                            <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-2">SERP Insight</p>
                            <p className="text-sm text-[#4B5563]">
                              Intent: <span className="font-medium text-[#111827]">{r.diagnosis.serp_analysis.intent_type}</span>
                              {" · "}
                              Format trend: <span className="font-medium text-[#111827]">{r.diagnosis.serp_analysis.content_format_trend}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reuse exact same brief card rendering */}
                    {r.brief && (
                      <TestBriefCard brief={r.brief} />
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      {/* Diagnosis results */}
      {diagnosis && !loading && !testResults && (
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
            <p className="text-[#4B5563] mb-4">{diagnosis.diagnosis.summary}</p>

            {/* Comparison badge */}
            {previousDiagnoses.length > 0 && (() => {
              const prevCauses = previousDiagnoses[0]!.diagnosis.causes.length;
              const currCauses = diagnosis.diagnosis.causes.length;
              const prevDate = new Date(previousDiagnoses[0]!.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

      {/* Previous Analyses — only show if there's history */}
      {previousDiagnoses.length > 0 && !loading && !testResults && (
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
                <AccordionItem key={prev.id} className="bg-white rounded-xl border border-[#E5E7EB] mb-2 overflow-hidden">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-[#F9FAFB]">
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-[#111827]">
                        Analysis from {new Date(prev.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p className="text-sm text-[#6B7280] mt-1 line-clamp-1">
                        &ldquo;{summaryPreview}&rdquo;
                      </p>
                      <p className="text-xs text-[#9CA3AF] mt-1.5">
                        {causesCount} cause{causesCount !== 1 ? "s" : ""}
                        {actionsCount > 0 && ` · ${actionsCount} action${actionsCount !== 1 ? "s" : ""}`}
                        {effort > 0 && ` · Est. ${effort}h total`}
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5">
                    <div className="space-y-4 pt-2">
                      {/* Diagnosis */}
                      <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-5">
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
                                <div className="flex items-start gap-2">
                                  <span className="text-sm">{sev.emoji}</span>
                                  <div>
                                    <p className="text-sm font-medium text-[#111827]">{cause.title}</p>
                                    <p className="text-xs text-[#4B5563] mt-1">{cause.description}</p>
                                    <p className="text-xs text-[#6B7280] mt-1.5 italic">Evidence: {cause.evidence}</p>
                                  </div>
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
                        <TestBriefCard brief={prev.refresh_brief} />
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
      {!diagnosis && !loading && !testResults && !testLoading && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
          <Zap size={32} strokeWidth={1.5} className="text-[#9CA3AF] mx-auto mb-3" />
          <p className="text-[#6B7280]">
            {isNew
              ? "Click \"Analyze\" to get AI-powered content recommendations for this page."
              : "Click \"Diagnose\" to find out why this page is losing traffic."
            }
          </p>
          <p className="text-xs text-[#9CA3AF] mt-2">
            {isFree
              ? "Upgrade to a paid plan to run AI diagnoses."
              : `Uses 1 of your ${diagnosesLimit} monthly diagnoses (${diagnosesUsed} used)`
            }
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Read-only brief card for test results (no checkboxes, no mark-as-updated).
 */
function TestBriefCard({ brief }: { brief: BriefData }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
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
            <div key={i} className="border border-[#E5E7EB] rounded-xl overflow-hidden">
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

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-[#F3F4F6]">
                  <p className="text-sm text-[#4B5563] mt-3 mb-3">{action.description}</p>

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
    </div>
  );
}
