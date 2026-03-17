"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, Loader2, Circle, Play, ArrowRight, X,
  Sparkles, Database, Gift,
} from "lucide-react";

type WelcomeCardProps = {
  siteId: string;
  domain: string;
  pagesCount: number;
  hasEngineRun: boolean;
  hasDiagnosis: boolean;
  freeDiagPageId: string | null;
  freeDiagPagePath: string | null;
  dismissed: boolean;
};

type Step = "pending" | "running" | "done";

export default function WelcomeCard({
  siteId,
  domain,
  pagesCount,
  hasEngineRun,
  hasDiagnosis,
  freeDiagPageId,
  freeDiagPagePath,
  dismissed: initialDismissed,
}: WelcomeCardProps) {
  const router = useRouter();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [dismissed, setDismissed] = useState(() => {
    if (initialDismissed) return true;
    // Returning user: engine already ran + has diagnosis = not a first visit
    if (hasEngineRun && hasDiagnosis && freeDiagPageId) return true;
    return false;
  });

  // Client actions: track whether user has triggered engine/diagnosis
  const [importStep] = useState<Step>("done");
  const [userTriggeredEngine, setUserTriggeredEngine] = useState(false);
  const [userTriggeredDiag, setUserTriggeredDiag] = useState(false);
  const [enginePagesOverride, setEnginePagesOverride] = useState<number | null>(null);
  const [diagPageIdOverride, setDiagPageIdOverride] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Derive steps: server props take priority, then local trigger state
  const engineStep: Step = hasEngineRun ? "done" : userTriggeredEngine ? "running" : "pending";
  const diagStep: Step = hasDiagnosis ? "done" : userTriggeredDiag ? "running" : "pending";
  const enginePages = enginePagesOverride ?? pagesCount;
  const diagPageId = freeDiagPageId ?? diagPageIdOverride;
  const diagPagePath = freeDiagPagePath;

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Poll by refreshing the server component data
  function startPolling(intervalMs: number) {
    stopPolling();
    pollRef.current = setInterval(() => {
      router.refresh();
    }, intervalMs);
  }

  async function handleRunEngine() {
    setUserTriggeredEngine(true);
    setError("");

    try {
      const res = await fetch("/api/engine/run", { method: "POST" });
      const json = (await res.json()) as { data?: { pagesProcessed?: number }; error?: string };

      if (!res.ok) {
        setError(json.error ?? "Failed to run engine");
        setUserTriggeredEngine(false);
        return;
      }

      setEnginePagesOverride(json.data?.pagesProcessed ?? pagesCount);
      router.refresh();

      // Auto-trigger free diagnosis
      setUserTriggeredDiag(true);
      const diagRes = await fetch("/api/diagnose/auto", { method: "POST" });
      const diagJson = (await diagRes.json()) as { data?: { status: string; pageId?: string } };

      if (diagJson.data?.status === "already_done") {
        setUserTriggeredDiag(false);
        router.refresh();
        return;
      }

      if (diagJson.data?.pageId) {
        setDiagPageIdOverride(diagJson.data.pageId);
      }

      // Poll for diagnosis completion (every 10s)
      startPolling(10_000);
    } catch {
      setError("Network error. Please try again.");
      setUserTriggeredEngine(false);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    stopPolling();
    fetch("/api/sites/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, field: "welcome_dismissed" }),
    }).catch(() => {});
  }

  if (dismissed) return null;

  const allDone = engineStep === "done" && diagStep === "done" && diagPageId;

  return (
    <div className="relative bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
      {/* Dismiss button */}
      {allDone && (
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      )}

      <h2 className="text-lg font-semibold text-[#111827] mb-1">
        Site connected! Here&apos;s what happens next
      </h2>
      <p className="text-sm text-[#6B7280] mb-5">
        {domain}
      </p>

      {/* Steps */}
      <div className="space-y-4 mb-6">
        {/* Step 1: Import */}
        <StepRow
          step={importStep}
          icon={<Database size={16} strokeWidth={1.5} />}
          label="Import data from Google Search Console"
          detail="done"
        />

        {/* Step 2: Engine */}
        <StepRow
          step={engineStep}
          icon={<Sparkles size={16} strokeWidth={1.5} />}
          label="Run the Decay Engine to analyze your pages"
          detail={
            engineStep === "done"
              ? `${enginePages} pages analyzed`
              : engineStep === "running"
              ? "Analyzing your pages..."
              : undefined
          }
        />

        {/* Step 3: Diagnosis */}
        <StepRow
          step={diagStep}
          icon={<Gift size={16} strokeWidth={1.5} />}
          label="Get your first AI diagnosis — free, on us"
          detail={
            diagStep === "done" && diagPagePath
              ? "Your first diagnosis is ready!"
              : diagStep === "running"
              ? "Generating your free diagnosis..."
              : undefined
          }
        />
      </div>

      {/* Description */}
      {engineStep === "pending" && (
        <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">
          The Decay Engine scans your imported data, calculates your Health Score, and identifies
          which pages need attention. After it runs, we&apos;ll automatically generate a free AI
          diagnosis for your most critical page. This usually takes about 1–2 minutes.
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-[#DC2626] mb-4">{error}</p>
      )}

      {/* Actions */}
      {engineStep === "pending" && (
        <div>
          <button
            onClick={handleRunEngine}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors"
          >
            <Play size={16} strokeWidth={1.5} />
            Run Decay Engine
          </button>
          <p className="text-xs text-[#9CA3AF] mt-3">
            The engine also runs automatically every day to keep your data fresh.
          </p>
        </div>
      )}

      {engineStep === "running" && (
        <button
          disabled
          className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#3B82F6] text-white text-sm font-semibold opacity-70 cursor-not-allowed"
        >
          <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
          Running...
        </button>
      )}

      {diagStep === "running" && engineStep === "done" && (
        <div className="flex items-center gap-3 text-sm text-[#7C3AED]">
          <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
          Generating diagnosis... this takes 2–3 minutes
        </div>
      )}

      {allDone && diagPageId && (
        <div className="flex items-center gap-3">
          <Link
            href={`/pages/${diagPageId}`}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition-colors"
          >
            View diagnosis
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
          <button
            onClick={handleDismiss}
            className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

function StepRow({
  step,
  icon,
  label,
  detail,
}: {
  step: Step;
  icon: React.ReactNode;
  label: string;
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">
        {step === "done" ? (
          <CheckCircle2 size={20} strokeWidth={1.5} className="text-[#16A34A]" />
        ) : step === "running" ? (
          <Loader2 size={20} strokeWidth={1.5} className="text-[#3B82F6] animate-spin" />
        ) : (
          <Circle size={20} strokeWidth={1.5} className="text-[#D1D5DB]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`${step === "done" ? "text-[#16A34A]" : step === "running" ? "text-[#3B82F6]" : "text-[#9CA3AF]"}`}>
            {icon}
          </span>
          <span className={`text-sm font-medium ${step === "done" ? "text-[#111827]" : step === "running" ? "text-[#111827]" : "text-[#6B7280]"}`}>
            {label}
          </span>
        </div>
        {detail && detail !== "done" && (
          <p className={`text-xs mt-0.5 ml-6 ${step === "done" ? "text-[#16A34A]" : "text-[#6B7280]"}`}>
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
