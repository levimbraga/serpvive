import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, Trophy, Clock } from "lucide-react";

type ResultItem = {
  id: string;
  pageId: string;
  pagePath: string;
  resultStatus: "success" | "partial" | "no_change" | "declined";
  clicksDeltaPct: number | null;
  resultCalculatedAt: string | null;
};

type MeasuringItem = {
  id: string;
  pageId: string;
  pagePath: string;
  refreshedAt: string;
};

const STATUS_CONFIG = {
  success:   { color: "#16A34A", bg: "#F0FDF4", icon: TrendingUp, label: "Success" },
  partial:   { color: "#D97706", bg: "#FFFBEB", icon: TrendingUp, label: "Partial" },
  no_change: { color: "#6B7280", bg: "#F9FAFB", icon: Minus, label: "No change" },
  declined:  { color: "#DC2626", bg: "#FEF2F2", icon: TrendingDown, label: "Declined" },
} as const;

function daysRemaining(refreshedAt: string): number {
  const refreshDate = new Date(refreshedAt);
  const measureDate = new Date(refreshDate.getTime() + 28 * 86400000);
  const now = new Date();
  return Math.max(0, Math.ceil((measureDate.getTime() - now.getTime()) / 86400000));
}

export default function RecentResults({ results, measuring = [], timeZone = "UTC" }: { results: ResultItem[]; measuring?: MeasuringItem[]; timeZone?: string }) {
  const hasContent = results.length > 0 || measuring.length > 0;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={18} strokeWidth={1.5} className="text-[#D97706]" />
        <h2 className="text-lg font-semibold text-[#111827]">Recent Results</h2>
      </div>

      {!hasContent ? (
        <div className="bg-white rounded-lg border border-[#E5E7EB] px-5 py-8 text-center">
          <p className="text-sm text-[#6B7280]">
            No results yet. Refresh a post and check back in 28 days!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          {results.map((r, i) => {
            const cfg = STATUS_CONFIG[r.resultStatus];
            const Icon = cfg.icon;
            const isLast = i === results.length - 1 && measuring.length === 0;

            return (
              <Link
                key={r.id}
                href={`/pages/${r.pageId}`}
                className={`flex items-center gap-4 px-5 py-3.5 hover:bg-[#F9FAFB] transition-colors ${
                  !isLast ? "border-b border-[#F3F4F6]" : ""
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: cfg.bg }}
                >
                  <Icon size={16} strokeWidth={1.5} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium text-[#111827] truncate"
                    style={{ fontFamily: "var(--font-mono, monospace)" }}
                  >
                    {r.pagePath}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    {r.resultCalculatedAt
                      ? new Date(r.resultCalculatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone })
                      : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: cfg.color }}
                  >
                    {r.clicksDeltaPct !== null
                      ? `${r.clicksDeltaPct > 0 ? "+" : ""}${r.clicksDeltaPct.toFixed(1)}%`
                      : "—"}
                  </span>
                  <p className="text-xs" style={{ color: cfg.color }}>{cfg.label}</p>
                </div>
              </Link>
            );
          })}

          {measuring.map((m, i) => {
            const days = daysRemaining(m.refreshedAt);
            return (
              <Link
                key={m.id}
                href={`/pages/${m.pageId}`}
                className={`flex items-center gap-4 px-5 py-3.5 hover:bg-[#F9FAFB] transition-colors ${
                  i < measuring.length - 1 ? "border-b border-[#F3F4F6]" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#EFF6FF]">
                  <Clock size={16} strokeWidth={1.5} className="text-[#2563EB]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium text-[#111827] truncate"
                    style={{ fontFamily: "var(--font-mono, monospace)" }}
                  >
                    {m.pagePath}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    Refreshed {new Date(m.refreshedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-[#2563EB] tabular-nums">
                    {days}d left
                  </span>
                  <p className="text-xs text-[#6B7280]">Measuring</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
