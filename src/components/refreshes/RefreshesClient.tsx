"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RefreshCw, TrendingUp, TrendingDown, Minus, Timer,
  Clock, ChevronDown, ChevronUp, ExternalLink, Search,
} from "lucide-react";

type RefreshItem = {
  id: string;
  pageId: string;
  diagnosisId: string | null;
  pagePath: string;
  pageUrl: string;
  refreshedAt: string;
  resultStatus: string;
  actionsCompleted: string[];
  beforeClicks: number | null;
  beforeImpressions: number | null;
  beforeCtr: number | null;
  beforePosition: number | null;
  afterClicks: number | null;
  afterImpressions: number | null;
  afterCtr: number | null;
  afterPosition: number | null;
  clicksDelta: number | null;
  clicksDeltaPct: number | null;
  resultCalculatedAt: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof TrendingUp }> = {
  pending:    { label: "Waiting (28 days)", color: "#2563EB", bg: "#EFF6FF", icon: Timer },
  measuring:  { label: "Measuring...",      color: "#D97706", bg: "#FFFBEB", icon: Clock },
  success:    { label: "Improved",          color: "#16A34A", bg: "#F0FDF4", icon: TrendingUp },
  partial:    { label: "Partial",           color: "#D97706", bg: "#FFFBEB", icon: TrendingUp },
  no_change:  { label: "No change",         color: "#6B7280", bg: "#F9FAFB", icon: Minus },
  declined:   { label: "Declined",          color: "#DC2626", bg: "#FEF2F2", icon: TrendingDown },
};

export default function RefreshesClient({ items, timeZone = "UTC" }: { items: RefreshItem[]; timeZone?: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [now] = useState(() => Date.now());

  const filtered = search
    ? items.filter((r) => r.pagePath.toLowerCase().includes(search.toLowerCase()) || r.pageUrl.toLowerCase().includes(search.toLowerCase()))
    : items;

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-[#111827]">Refresh History</h1>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-12 text-center">
          <RefreshCw size={40} strokeWidth={1.5} className="text-[#D1D5DB] mx-auto mb-4" />
          <p className="text-[#6B7280] mb-2">No refreshes yet.</p>
          <p className="text-sm text-[#9CA3AF] max-w-md mx-auto">
            Run a diagnosis on a decaying page, make your improvements, then mark it as updated to start tracking results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-semibold text-[#111827]">Refresh History</h1>
        <div className="relative">
          <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by URL..."
            className="h-9 w-full sm:w-64 pl-9 pr-3 text-sm text-[#111827] border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => {
          const cfg = STATUS_CONFIG[item.resultStatus] ?? STATUS_CONFIG["pending"]!;
          const StatusIcon = cfg.icon;
          const isExpanded = expandedId === item.id;
          const hasResult = item.resultStatus !== "pending" && item.resultStatus !== "measuring";
          const daysRemaining = item.resultStatus === "pending"
            ? Math.max(0, 28 - Math.floor((now - new Date(item.refreshedAt).getTime()) / (1000 * 60 * 60 * 24)))
            : null;

          return (
            <div key={item.id} className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
              {/* Row header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#F9FAFB] transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: cfg.bg }}
                >
                  <StatusIcon size={18} strokeWidth={1.5} style={{ color: cfg.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/pages/${item.pageId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-medium text-[#111827] hover:text-[#3B82F6] transition-colors truncate block"
                    style={{ fontFamily: "var(--font-mono, monospace)" }}
                  >
                    {item.pagePath}
                  </Link>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Marked updated {new Date(item.refreshedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone })}
                    {daysRemaining !== null && ` — ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`}
                    {item.resultCalculatedAt && ` — Measured ${new Date(item.resultCalculatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone })}`}
                  </p>
                </div>

                {/* Delta badge */}
                {hasResult && item.clicksDeltaPct !== null && (
                  <span className={`text-sm font-semibold tabular-nums flex-shrink-0 ${
                    item.clicksDeltaPct > 0 ? "text-[#16A34A]" :
                    item.clicksDeltaPct < 0 ? "text-[#DC2626]" :
                    "text-[#6B7280]"
                  }`}>
                    {item.clicksDeltaPct > 0 ? "+" : ""}{item.clicksDeltaPct.toFixed(1)}%
                  </span>
                )}

                {/* Status badge */}
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ color: cfg.color, backgroundColor: cfg.bg }}
                >
                  {cfg.label}
                </span>

                {isExpanded ? (
                  <ChevronUp size={16} strokeWidth={1.5} className="text-[#9CA3AF] flex-shrink-0" />
                ) : (
                  <ChevronDown size={16} strokeWidth={1.5} className="text-[#9CA3AF] flex-shrink-0" />
                )}
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-[#F3F4F6]">
                  {hasResult && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F9FAFB] rounded-lg p-4 mt-3">
                      <MetricCol label="Clicks (28d)" before={item.beforeClicks} after={item.afterClicks} />
                      <MetricCol label="Impressions" before={item.beforeImpressions} after={item.afterImpressions} />
                      <MetricCol label="CTR" before={item.beforeCtr ? (item.beforeCtr * 100) : null} after={item.afterCtr ? (item.afterCtr * 100) : null} suffix="%" decimals={1} />
                      <MetricCol label="Avg Position" before={item.beforePosition} after={item.afterPosition} prefix="#" decimals={1} inverted />
                    </div>
                  )}

                  {!hasResult && (
                    <div className="bg-[#F9FAFB] rounded-lg p-4 mt-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-[#9CA3AF]">Before Clicks</p>
                          <p className="text-sm font-medium text-[#111827] tabular-nums">{item.beforeClicks ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#9CA3AF]">Before Impressions</p>
                          <p className="text-sm font-medium text-[#111827] tabular-nums">{item.beforeImpressions ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#9CA3AF]">Before CTR</p>
                          <p className="text-sm font-medium text-[#111827] tabular-nums">{item.beforeCtr ? `${(item.beforeCtr * 100).toFixed(1)}%` : "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#9CA3AF]">Before Position</p>
                          <p className="text-sm font-medium text-[#111827] tabular-nums">{item.beforePosition ? `#${item.beforePosition.toFixed(1)}` : "—"}</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-3">
                        Results will be measured automatically 28 days after you marked this page as updated.
                      </p>
                    </div>
                  )}

                  {item.actionsCompleted.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-[#9CA3AF] mb-1.5">Actions completed</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.actionsCompleted.map((a, i) => (
                          <span key={i} className="text-xs bg-[#F0FDF4] text-[#16A34A] px-2 py-0.5 rounded-md">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3">
                    <Link
                      href={`/pages/${item.pageId}`}
                      className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1"
                    >
                      View page detail <ExternalLink size={10} strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && search && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 text-center">
          <p className="text-sm text-[#6B7280]">No refreshes match your search.</p>
        </div>
      )}
    </div>
  );
}

function MetricCol({
  label,
  before,
  after,
  prefix = "",
  suffix = "",
  decimals = 0,
  inverted = false,
}: {
  label: string;
  before: number | null;
  after: number | null;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  inverted?: boolean;
}) {
  const fmt = (v: number | null) => v !== null ? `${prefix}${v.toFixed(decimals)}${suffix}` : "—";
  const diff = before !== null && after !== null ? after - before : null;
  const isGood = diff !== null ? (inverted ? diff < 0 : diff > 0) : null;

  return (
    <div>
      <p className="text-xs text-[#9CA3AF] mb-1">{label}</p>
      <p className="text-sm text-[#6B7280] tabular-nums">{fmt(before)}</p>
      <p className="text-sm font-semibold text-[#111827] tabular-nums">{fmt(after)}</p>
      {diff !== null && (
        <p className={`text-xs font-medium mt-0.5 tabular-nums ${
          isGood ? "text-[#16A34A]" : diff === 0 ? "text-[#6B7280]" : "text-[#DC2626]"
        }`}>
          {diff > 0 ? "+" : ""}{diff.toFixed(decimals)}{suffix}
        </p>
      )}
    </div>
  );
}
