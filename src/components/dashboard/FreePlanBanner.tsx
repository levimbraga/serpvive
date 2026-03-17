"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Zap } from "lucide-react";

type FreePlanBannerProps = {
  siteStatus: string;
  lastSyncAt: string | null;
  timeZone?: string;
};

export default function FreePlanBanner({ siteStatus, lastSyncAt, timeZone = "UTC" }: FreePlanBannerProps) {
  const isPaused = siteStatus === "paused";

  if (isPaused) {
    const lastSyncDate = lastSyncAt
      ? new Date(lastSyncAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone })
      : "unknown";

    return (
      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} strokeWidth={1.5} className="text-[#DC2626] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#991B1B]">
              Your monitoring is paused
            </p>
            <p className="text-xs text-[#DC2626] mt-0.5">
              Data was last updated on {lastSyncDate}. Upgrade to resume real-time monitoring.
            </p>
          </div>
        </div>
        <Link
          href="/settings#upgrade-section"
          className="flex items-center gap-1 h-9 px-4 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors whitespace-nowrap"
        >
          Upgrade Now
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Zap size={20} strokeWidth={1.5} className="text-[#D97706] flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-[#92400E]">
            You&apos;re on the free plan
          </p>
          <p className="text-xs text-[#B45309] mt-0.5">
            Your data syncs weekly instead of daily. Upgrade for real-time monitoring + AI diagnoses.
          </p>
        </div>
      </div>
      <Link
        href="/settings#upgrade-section"
        className="flex items-center gap-1.5 text-sm font-medium text-[#92400E] hover:text-[#78350F] whitespace-nowrap"
      >
        Upgrade
        <ArrowUpRight size={16} strokeWidth={1.5} />
      </Link>
    </div>
  );
}
