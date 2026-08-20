"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, Loader2, Circle, Play, ArrowRight, X,
  Sparkles, Database, Gift,
} from "lucide-react";

type AutoDiagStatus = "pending" | "engine_running" | "diagnosing" | "completed" | "failed";

type WelcomeCardProps = {
  siteId: string;
  domain: string;
  pagesCount: number;
  hasEngineRun: boolean;
  autoDiagStatus: AutoDiagStatus;
  freeDiagPageId: string | null;
  freeDiagPagePath: string | null;
  dismissed: boolean;
  userHasUsedFreeDiagnosis?: boolean;
  plan?: string;
};

type Step = "pending" | "running" | "done";

export default function WelcomeCard({
  siteId,
  domain,
  pagesCount,
  hasEngineRun,
  autoDiagStatus,
  freeDiagPageId,
  dismissed: initialDismissed,
  userHasUsedFreeDiagnosis = false,
}: WelcomeCardProps) {
  const router = useRouter();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [dismissed, setDismissed] = useState(() => {
    if (initialDismissed) return true;
    if (autoDiagStatus === "completed" && freeDiagPageId) return true;
    return false;
  });

  // Local state only for engine run (which completes in-page)
  const [userTriggeredEngine, setUserTriggeredEngine] = useState(false);
  const [enginePagesOverride, setEnginePagesOverride] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Steps derived from DB-persisted state (server props)
  const engineStep: Step = hasEngineRun ? "done" : userTriggeredEngine ? "running" : "pending";
  // If user already used free diagnosis on another site, skip the diagnosis step
  // BUT not while a diagnosis is actively running on THIS site
  const isSubsequentSite = userHasUsedFreeDiagnosis && !freeDiagPageId && autoDiagStatus !== "diagnosing";
  const diagStep: Step =
    autoDiagStatus === "diagnosing" ? "running" :
    isSubsequentSite ? "done" :
    autoDiagStatus === "completed" ? "done" :
    "pending";
  const enginePages = enginePagesOverride ?? pagesCount;

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Auto-poll when diagnosing (status comes from DB via server refresh)
  useEffect(() => {
    if (autoDiagStatus === "diagnosing") {
      stopPolling();
      pollRef.current = setInterval(() => router.refresh(), 5_000);
    } else {
      stopPolling();
    }
  }, [autoDiagStatus, router, stopPolling]);

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

      // Auto-trigger free diagnosis only if user hasn't used it on another site
      if (!userHasUsedFreeDiagnosis) {
        await fetch("/api/diagnose/auto", { method: "POST" });
      }

      // Refresh to pick up new status from DB
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setUserTriggeredEngine(false);
    }
  }

  async function handleRetryDiagnosis() {
    setError("");

    try {
      const res = await fetch("/api/diagnose/auto", { method: "POST" });
      const json = (await res.json()) as { data?: { status: string } };

      if (json.data?.status === "failed") {
        setError("Auto-diagnosis failed. You can pick any page to analyze manually.");
      }

      // Refresh to pick up new status from DB
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
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

  const allDone = engineStep === "done" && diagStep === "done" && freeDiagPageId;

  return (
    <div className="relative bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-sm">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} strokeWidth={1.5} />
      </button>

      <h2 className="text-lg font-semibold text-[#111827] mb-1">
        Site connected! Here&apos;s what happens next
      </h2>
      <p className="text-sm text-[#6B7280] mb-5">{domain}</p>

      {/* Steps */}
      <div className="space-y-4 mb-6">
        <StepRow
          step="done"
          icon={<Database size={16} strokeWidth={1.5} />}
          label="Import data from Google Search Console"
          detail="done"
        />
        <StepRow
          step={engineStep}
          icon={<Sparkles size={16} strokeWidth={1.5} />}
          label="Run the Decay Engine to analyze your pages"
          detail={
            engineStep === "done" ? `${enginePages} pages analyzed`
            : engineStep === "running" ? "Analyzing your pages..."
            : undefined
          }
        />
        <StepRow
          step={diagStep}
          icon={<Gift size={16} strokeWidth={1.5} />}
          label={isSubsequentSite
            ? "Run AI diagnosis on your pages"
            : "Get your first AI diagnosis — free, on us"
          }
          detail={
            isSubsequentSite ? "Pick a page to analyze"
            : diagStep === "done" ? "Your first diagnosis is ready!"
            : diagStep === "running" ? "Generating your free diagnosis..."
            : autoDiagStatus === "failed" ? "Pick any page to analyze manually"
            : undefined
          }
        />
      </div>

      {/* Error */}
      {error && <p className="text-sm text-[#DC2626] mb-4">{error}</p>}

      {/* Actions based on state */}
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
        <button disabled className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#3B82F6] text-white text-sm font-semibold opacity-70 cursor-not-allowed">
          <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
          Running...
        </button>
      )}

      {diagStep === "running" && engineStep === "done" && (
        <div className="flex items-center gap-3 text-sm text-[#7C3AED]">
          <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
          Generating diagnosis... this usually takes 3–5 minutes
        </div>
      )}

      {/* Engine done + diagnosis pending or failed — show action */}
      {diagStep === "pending" && engineStep === "done" && (
        <div>
          <div className="flex items-center gap-3">
            {autoDiagStatus === "failed" ? (
              <Link
                href="/pages"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition-colors"
              >
                <Gift size={16} strokeWidth={1.5} />
                Pick a page to analyze
              </Link>
            ) : (
              <>
                <button
                  onClick={handleRetryDiagnosis}
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition-colors"
                >
                  <Gift size={16} strokeWidth={1.5} />
                  Get Free Diagnosis
                </button>
                <Link href="/pages" className="text-sm text-[#7C3AED] hover:text-[#6D28D9] font-medium transition-colors">
                  or pick a page
                </Link>
              </>
            )}
          </div>
          <p className="text-xs text-[#9CA3AF] mt-3">
            {autoDiagStatus === "failed"
              ? "Your free diagnosis is ready — choose any page."
              : "AI will analyze your most important page and explain what to improve."}
          </p>
        </div>
      )}

      {/* Subsequent site (free diagnosis already used): show plan-appropriate action */}
      {isSubsequentSite && engineStep === "done" && (
        <div className="flex items-center gap-3">
          <Link
            href="/pages"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition-colors"
          >
            <Sparkles size={16} strokeWidth={1.5} />
            Pick a page to analyze
          </Link>
          <button onClick={handleDismiss} className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            Dismiss
          </button>
        </div>
      )}

      {allDone && freeDiagPageId && (
        <div className="flex items-center gap-3">
          <Link
            href={`/pages/${freeDiagPageId}`}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold transition-colors"
          >
            View diagnosis
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
          <button onClick={handleDismiss} className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

function StepRow({ step, icon, label, detail }: { step: Step; icon: React.ReactNode; label: string; detail?: string }) {
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
          <span className={step === "done" ? "text-[#16A34A]" : step === "running" ? "text-[#3B82F6]" : "text-[#9CA3AF]"}>
            {icon}
          </span>
          <span className={`text-sm font-medium ${step === "done" || step === "running" ? "text-[#111827]" : "text-[#6B7280]"}`}>
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
