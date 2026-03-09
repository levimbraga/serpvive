"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowUpDown } from "lucide-react";

type PageData = {
  id: string;
  url: string;
  path: string;
  status: string;
  current_clicks_28d: number;
  peak_clicks_monthly: number;
  decay_score: number;
  decay_velocity_7d: number;
  decay_velocity_28d: number;
  primary_keyword: string | null;
  primary_position: number | null;
  last_diagnosis_at: string | null;
  updated_at: string;
};

type SortKey = "decay_score" | "current_clicks_28d" | "status" | "peak_clicks_monthly" | "decay_velocity_7d";
type SortDir = "asc" | "desc";

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; order: number }> = {
  critical: { color: "#DC2626", bg: "#FEF2F2", label: "Critical", order: 0 },
  dead:     { color: "#6B7280", bg: "#F9FAFB", label: "Dead", order: 1 },
  warning:  { color: "#D97706", bg: "#FFFBEB", label: "Warning", order: 2 },
  new:      { color: "#2563EB", bg: "#EFF6FF", label: "New", order: 3 },
  healthy:  { color: "#16A34A", bg: "#F0FDF4", label: "Healthy", order: 4 },
  unknown:  { color: "#9CA3AF", bg: "#F9FAFB", label: "Unknown", order: 5 },
};

export default function PagesTable({ pages }: { pages: PageData[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("decay_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const filtered = useMemo(() => {
    let result = pages;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.path.toLowerCase().includes(q) || p.url.toLowerCase().includes(q),
      );
    }

    result = [...result].sort((a, b) => {
      let av: number, bv: number;

      if (sortKey === "status") {
        av = STATUS_CONFIG[a.status]?.order ?? 5;
        bv = STATUS_CONFIG[b.status]?.order ?? 5;
      } else {
        av = a[sortKey];
        bv = b[sortKey];
      }

      return sortDir === "desc" ? bv - av : av - bv;
    });

    return result;
  }, [pages, search, sortKey, sortDir]);

  const columns: { key: SortKey; label: string; className: string }[] = [
    { key: "status", label: "Status", className: "w-[100px]" },
    { key: "current_clicks_28d", label: "Clicks (28d)", className: "w-[110px] text-right" },
    { key: "peak_clicks_monthly", label: "Peak", className: "w-[90px] text-right" },
    { key: "decay_score", label: "Decay %", className: "w-[100px] text-right" },
    { key: "decay_velocity_7d", label: "Velocity", className: "w-[100px] text-right" },
  ];

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="text-left px-5 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  URL
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider cursor-pointer hover:text-[#111827] select-none ${col.className}`}
                    onClick={() => toggleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown size={12} strokeWidth={1.5} className={
                        sortKey === col.key ? "text-[#3B82F6]" : "text-[#D1D5DB]"
                      } />
                    </span>
                  </th>
                ))}
                <th className="w-[120px] px-3 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider text-right">
                  Last Diagnosis
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((page) => {
                const cfg = STATUS_CONFIG[page.status] ?? STATUS_CONFIG["unknown"]!;
                return (
                  <tr
                    key={page.id}
                    className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/pages/${page.id}`}
                        className="text-sm text-[#111827] hover:text-[#3B82F6] truncate block max-w-[400px]"
                        style={{ fontFamily: "var(--font-mono, monospace)" }}
                      >
                        {page.path}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ color: cfg.color, backgroundColor: cfg.bg }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-[#111827] text-right font-medium tabular-nums">
                      {page.current_clicks_28d.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-sm text-[#6B7280] text-right tabular-nums">
                      {page.peak_clicks_monthly.toLocaleString()}
                    </td>
                    <td className={`px-3 py-3 text-sm text-right font-medium tabular-nums ${
                      page.decay_score >= 30 ? "text-[#DC2626]" :
                      page.decay_score >= 15 ? "text-[#D97706]" :
                      "text-[#111827]"
                    }`}>
                      {page.decay_score > 0 ? `${page.decay_score.toFixed(1)}%` : "—"}
                    </td>
                    <td className={`px-3 py-3 text-sm text-right tabular-nums ${
                      page.decay_velocity_7d > 0 ? "text-[#DC2626]" :
                      page.decay_velocity_7d < 0 ? "text-[#16A34A]" :
                      "text-[#6B7280]"
                    }`}>
                      {page.decay_velocity_7d !== 0
                        ? `${page.decay_velocity_7d > 0 ? "+" : ""}${page.decay_velocity_7d.toFixed(1)}%`
                        : "—"
                      }
                    </td>
                    <td className="px-3 py-3 text-xs text-[#9CA3AF] text-right">
                      {page.last_diagnosis_at
                        ? new Date(page.last_diagnosis_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Never"
                      }
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-[#6B7280]">
                    {search ? "No pages match your search." : "No pages found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <p className="text-xs text-[#9CA3AF]">
            {filtered.length} of {pages.length} pages
          </p>
        </div>
      </div>
    </div>
  );
}
