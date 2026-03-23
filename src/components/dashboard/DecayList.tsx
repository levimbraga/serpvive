"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

const PAGE_SIZE = 25;

type PageRow = {
  id: string;
  path: string;
  url: string;
  status: "healthy" | "warning" | "critical" | "dead" | "new" | "unknown" | "redirected";
  currentClicks28d: number;
  decayScore: number;
  velocity7d: number;
};

type DecayListProps = {
  pages: PageRow[];
  isNewSite?: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  healthy: "#16A34A", warning: "#D97706", critical: "#DC2626",
  dead: "#6B7280", new: "#2563EB", unknown: "#9CA3AF", redirected: "#9CA3AF",
};

export default function DecayList({ pages, isNewSite }: DecayListProps) {
  const [showAll, setShowAll] = useState(false);

  // Sort: for new sites sort by clicks desc; otherwise by urgency
  const sorted = [...pages].sort((a, b) => {
    if (isNewSite) {
      return b.currentClicks28d - a.currentClicks28d;
    }
    const priorityOrder: Record<string, number> = {
      critical: 0, dead: 1, warning: 2, new: 3, healthy: 4, unknown: 5,
    };
    const pa = priorityOrder[a.status] ?? 5;
    const pb = priorityOrder[b.status] ?? 5;
    if (pa !== pb) return pa - pb;
    return b.decayScore - a.decayScore;
  });

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 text-center">
        <p className="text-lg mb-1">All clear!</p>
        <p className="text-[#6B7280]">No pages are losing traffic right now. We&apos;ll alert you if anything changes.</p>
      </div>
    );
  }

  const displayPages = showAll ? sorted : sorted.slice(0, PAGE_SIZE);
  const hasMore = sorted.length > PAGE_SIZE;

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
      {/* Header */}
      <div className="hidden md:grid grid-cols-[1fr_100px_100px_100px_120px] gap-4 px-5 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Page</span>
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider text-right">Clicks (28d)</span>
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider text-right">
          {isNewSite ? "Position" : "Decay"}
        </span>
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider text-right">
          {isNewSite ? "Impressions" : "Velocity"}
        </span>
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider text-right">Status</span>
      </div>

      {/* Rows */}
      {displayPages.map((page) => {
        const dotColor = STATUS_COLORS[page.status] ?? "#9CA3AF";
        return (
          <div key={page.id}>
          <Link
            href={`/pages/${page.id}`}
            className="hidden md:grid grid-cols-[1fr_100px_100px_100px_120px] gap-4 px-5 py-3.5 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors duration-150 items-center"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: dotColor }}
              />
              <span
                className="text-sm text-[#111827] truncate"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              >
                {page.path}
              </span>
            </div>

            <span className="text-sm text-[#111827] text-right font-medium tabular-nums">
              {page.currentClicks28d.toLocaleString()}
            </span>

            {isNewSite ? (
              <span className="text-sm text-[#6B7280] text-right tabular-nums">—</span>
            ) : (
              <span className={`text-sm text-right font-medium tabular-nums ${
                page.decayScore >= 30 ? "text-[#DC2626]" :
                page.decayScore >= 15 ? "text-[#D97706]" :
                "text-[#111827]"
              }`}>
                {page.decayScore > 0 ? `${page.decayScore.toFixed(1)}%` : "—"}
              </span>
            )}

            {isNewSite ? (
              <span className="text-sm text-[#6B7280] text-right tabular-nums">—</span>
            ) : (
              <span className={`text-sm text-right tabular-nums ${
                page.velocity7d > 0 ? "text-[#DC2626]" :
                page.velocity7d < 0 ? "text-[#16A34A]" :
                "text-[#6B7280]"
              }`}>
                {page.velocity7d !== 0
                  ? `${page.velocity7d > 0 ? "+" : ""}${page.velocity7d.toFixed(1)}%`
                  : "—"
                }
              </span>
            )}

            <div className="flex justify-end">
              <StatusBadge status={page.status} />
            </div>
          </Link>

          {/* Mobile card view */}
          <Link
            href={`/pages/${page.id}`}
            className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: dotColor }}
            />
            <div className="flex-1 min-w-0">
              <span
                className="text-sm text-[#111827] truncate block"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              >
                {page.path}
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-[#6B7280]">{page.currentClicks28d} clicks</span>
                {!isNewSite && page.decayScore > 0 && (
                  <span className={`text-xs font-medium ${
                    page.decayScore >= 30 ? "text-[#DC2626]" :
                    page.decayScore >= 15 ? "text-[#D97706]" :
                    "text-[#111827]"
                  }`}>
                    {page.decayScore.toFixed(1)}% decay
                  </span>
                )}
              </div>
            </div>
            <StatusBadge status={page.status} />
          </Link>
          </div>
        );
      })}

      {/* Show more / View all */}
      {hasMore && !showAll && (
        <div className="flex items-center justify-center gap-4 py-3 border-t border-[#E5E7EB]">
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors"
          >
            Show all {sorted.length} pages
          </button>
          <Link
            href="/pages"
            className="text-sm text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          >
            View in Pages table →
          </Link>
        </div>
      )}
    </div>
  );
}
