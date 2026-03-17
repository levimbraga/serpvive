"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, AlertCircle, X } from "lucide-react";

type FreeDiagnosisBannerProps = {
  siteId: string;
  pageId: string | null;
  pagePath: string | null;
  isProcessing: boolean;
  dismissed: boolean;
};

const MAX_POLL_TIME_MS = 5 * 60 * 1000; // 5 minutes
const POLL_INTERVAL_MS = 15_000; // 15 seconds

export default function FreeDiagnosisBanner({ siteId, pageId, pagePath, isProcessing, dismissed: initialDismissed }: FreeDiagnosisBannerProps) {
  const router = useRouter();
  const triggered = useRef(false);
  const startTime = useRef(Date.now());
  const [timedOut, setTimedOut] = useState(false);
  const [dismissed, setDismissed] = useState(initialDismissed);

  // If processing, trigger the retry endpoint and poll for completion
  useEffect(() => {
    if (!isProcessing || triggered.current) return;
    triggered.current = true;
    startTime.current = Date.now();

    // Fire the auto-diagnosis endpoint (non-blocking)
    fetch("/api/diagnose/auto", { method: "POST" }).catch(() => {});

    // Poll for completion every 15s, with 5-minute timeout
    const interval = setInterval(() => {
      if (Date.now() - startTime.current > MAX_POLL_TIME_MS) {
        clearInterval(interval);
        setTimedOut(true);
        return;
      }
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isProcessing, router]);

  if (timedOut) {
    return (
      <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg px-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#FEF9C3] flex items-center justify-center flex-shrink-0">
          <AlertCircle size={20} strokeWidth={1.5} className="text-[#D97706]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#92400E]">
            Diagnosis is taking longer than expected
          </p>
          <p className="text-xs text-[#B45309] mt-0.5">
            Refresh the page to check if it completed, or run a new diagnosis from any page.
          </p>
        </div>
        <button
          onClick={() => router.refresh()}
          className="flex-shrink-0 h-8 px-3 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-medium transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg px-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
          <Loader2 size={20} strokeWidth={1.5} className="text-[#7C3AED] animate-spin" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#5B21B6]">
            AI is analyzing your top page...
          </p>
          <p className="text-xs text-[#7C3AED] mt-0.5">
            This takes 2–3 minutes. Your free first diagnosis will appear here.
          </p>
        </div>
      </div>
    );
  }

  if (!pageId || !pagePath || dismissed) return null;

  async function handleDismiss() {
    setDismissed(true);
    await fetch("/api/sites/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, field: "free_diag_dismissed" }),
    }).catch(() => {});
  }

  return (
    <div className="relative bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg px-5 py-4 hover:bg-[#EDE9FE] transition-colors group">
      <Link href={`/pages/${pageId}`} className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#EDE9FE] flex items-center justify-center flex-shrink-0 group-hover:bg-[#DDD6FE] transition-colors">
          <Sparkles size={20} strokeWidth={1.5} className="text-[#7C3AED]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#5B21B6]">
            We analyzed your most important page
          </p>
          <p
            className="text-xs text-[#7C3AED] mt-0.5 truncate"
            style={{ fontFamily: "var(--font-mono, monospace)" }}
          >
            {pagePath}
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-[#7C3AED] whitespace-nowrap mr-6">
          See diagnosis
          <ArrowRight size={16} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute top-3 right-3 p-1 rounded-lg text-[#A78BFA] hover:text-[#5B21B6] hover:bg-[#EDE9FE] transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}
