"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

type FreeDiagnosisBannerProps = {
  pageId: string | null;
  pagePath: string | null;
  isProcessing: boolean;
};

export default function FreeDiagnosisBanner({ pageId, pagePath, isProcessing }: FreeDiagnosisBannerProps) {
  const router = useRouter();
  const triggered = useRef(false);

  // If processing, trigger the retry endpoint and poll for completion
  useEffect(() => {
    if (!isProcessing || triggered.current) return;
    triggered.current = true;

    // Fire the auto-diagnosis endpoint (non-blocking)
    fetch("/api/diagnose/auto", { method: "POST" }).catch(() => {});

    // Poll for completion every 15s
    const interval = setInterval(() => {
      router.refresh();
    }, 15000);

    return () => clearInterval(interval);
  }, [isProcessing, router]);

  if (isProcessing) {
    return (
      <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
          <Loader2 size={20} strokeWidth={1.5} className="text-[#7C3AED] animate-spin" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#5B21B6]">
            AI is analyzing your top page...
          </p>
          <p className="text-xs text-[#7C3AED] mt-0.5">
            This takes about 2 minutes. Your free first diagnosis will appear here.
          </p>
        </div>
      </div>
    );
  }

  if (!pageId || !pagePath) return null;

  return (
    <Link
      href={`/pages/${pageId}`}
      className="block bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl px-5 py-4 hover:bg-[#EDE9FE] transition-colors group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center flex-shrink-0 group-hover:bg-[#DDD6FE] transition-colors">
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
        <div className="flex items-center gap-1 text-sm font-medium text-[#7C3AED] whitespace-nowrap">
          See diagnosis
          <ArrowRight size={16} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
