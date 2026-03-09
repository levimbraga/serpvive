import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react";

type ResultItem = {
  id: string;
  pageId: string;
  pagePath: string;
  resultStatus: "success" | "partial" | "no_change" | "declined";
  clicksDeltaPct: number | null;
  resultCalculatedAt: string | null;
};

const STATUS_CONFIG = {
  success:   { color: "#16A34A", bg: "#F0FDF4", icon: TrendingUp, label: "Success" },
  partial:   { color: "#D97706", bg: "#FFFBEB", icon: TrendingUp, label: "Partial" },
  no_change: { color: "#6B7280", bg: "#F9FAFB", icon: Minus, label: "No change" },
  declined:  { color: "#DC2626", bg: "#FEF2F2", icon: TrendingDown, label: "Declined" },
} as const;

export default function RecentResults({ results }: { results: ResultItem[] }) {
  if (results.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={18} strokeWidth={1.5} className="text-[#D97706]" />
        <h2 className="text-lg font-semibold text-[#111827]">Recent Results</h2>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {results.map((r, i) => {
          const cfg = STATUS_CONFIG[r.resultStatus];
          const Icon = cfg.icon;

          return (
            <Link
              key={r.id}
              href={`/pages/${r.pageId}`}
              className={`flex items-center gap-4 px-5 py-3.5 hover:bg-[#F9FAFB] transition-colors ${
                i < results.length - 1 ? "border-b border-[#F3F4F6]" : ""
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
                    ? new Date(r.resultCalculatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
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
      </div>
    </div>
  );
}
