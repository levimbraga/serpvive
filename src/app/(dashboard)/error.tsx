"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard-error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <p className="text-5xl font-extrabold text-[#E5E7EB] select-none mb-4">Oops</p>
      <h1 className="text-xl font-semibold text-[#111827] mb-2">
        Something went wrong
      </h1>
      <p className="text-[#6B7280] max-w-md mb-8">
        We hit an unexpected error. This is usually temporary — try refreshing the page.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors"
        >
          <RefreshCw size={16} strokeWidth={1.5} />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center h-11 px-6 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#D1D5DB] text-sm font-medium transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
