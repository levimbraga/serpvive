"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search, ArrowUpDown, X, ChevronLeft, ChevronRight,
  MoreHorizontal, EyeOff, Eye, Sparkles, Plus,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const PAGE_SIZE = 25;

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
type SortPreset = "most_critical" | "most_traffic_lost" | "status" | "recent";

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; order: number }> = {
  critical:   { color: "#DC2626", bg: "#FEF2F2", label: "Critical", order: 0 },
  dead:       { color: "#6B7280", bg: "#F9FAFB", label: "Dead", order: 1 },
  warning:    { color: "#D97706", bg: "#FFFBEB", label: "Warning", order: 2 },
  new:        { color: "#2563EB", bg: "#EFF6FF", label: "New", order: 3 },
  healthy:    { color: "#16A34A", bg: "#F0FDF4", label: "Healthy", order: 4 },
  unknown:    { color: "#9CA3AF", bg: "#F9FAFB", label: "Unknown", order: 5 },
  redirected: { color: "#9CA3AF", bg: "#F9FAFB", label: "Redirected", order: 6 },
  excluded:   { color: "#6B7280", bg: "#F3F4F6", label: "Excluded", order: 7 },
};

const SORT_PRESETS: { key: SortPreset; label: string }[] = [
  { key: "most_critical", label: "Most Critical" },
  { key: "most_traffic_lost", label: "Most Traffic Lost" },
  { key: "status", label: "Status" },
  { key: "recent", label: "Recent" },
];

type PagesTableProps = {
  pages: PageData[];
  timeZone?: string;
  siteId?: string;
  siteDomain?: string;
};

export default function PagesTable({ pages, timeZone = "UTC", siteId, siteDomain }: PagesTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("decay_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activePreset, setActivePreset] = useState<SortPreset>("most_critical");
  const [currentPage, setCurrentPage] = useState(1);
  const [showExcluded, setShowExcluded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  // Exclude confirmation dialog
  const [excludeTarget, setExcludeTarget] = useState<PageData | null>(null);

  // Bulk exclude confirmation
  const [bulkExcludeOpen, setBulkExcludeOpen] = useState(false);

  // Add page dialog
  const [addPageOpen, setAddPageOpen] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addKeyword, setAddKeyword] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  function applyPreset(preset: SortPreset) {
    setActivePreset(preset);
    setCurrentPage(1);
    switch (preset) {
      case "most_critical":
        setSortKey("decay_score");
        setSortDir("desc");
        break;
      case "most_traffic_lost":
        setSortKey("peak_clicks_monthly");
        setSortDir("desc");
        break;
      case "status":
        setSortKey("status");
        setSortDir("asc");
        break;
      case "recent":
        setSortKey("decay_score");
        setSortDir("desc");
        break;
    }
  }

  function toggleSort(key: SortKey) {
    setActivePreset("most_critical");
    setCurrentPage(1);
    if (sortKey === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const filtered = useMemo(() => {
    let result = pages;

    // Filter excluded pages unless toggle is on
    if (!showExcluded) {
      result = result.filter((p) => p.status !== "excluded");
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.path.toLowerCase().includes(q) || p.url.toLowerCase().includes(q)
          || (p.primary_keyword && p.primary_keyword.toLowerCase().includes(q)),
      );
    }

    result = [...result].sort((a, b) => {
      if (activePreset === "most_traffic_lost") {
        const aLost = a.peak_clicks_monthly - a.current_clicks_28d;
        const bLost = b.peak_clicks_monthly - b.current_clicks_28d;
        return sortDir === "desc" ? bLost - aLost : aLost - bLost;
      }

      if (activePreset === "recent") {
        const aDate = a.last_diagnosis_at ? new Date(a.last_diagnosis_at).getTime() : 0;
        const bDate = b.last_diagnosis_at ? new Date(b.last_diagnosis_at).getTime() : 0;
        return sortDir === "desc" ? bDate - aDate : aDate - bDate;
      }

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
  }, [pages, search, sortKey, sortDir, activePreset, showExcluded]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRows = filtered.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  // Selection helpers
  const allOnPageSelected = paginatedRows.length > 0 && paginatedRows.every((p) => selectedIds.has(p.id));

  function toggleSelectAll() {
    const next = new Set(selectedIds);
    if (allOnPageSelected) {
      for (const p of paginatedRows) next.delete(p.id);
    } else {
      for (const p of paginatedRows) {
        if (p.status !== "excluded" && p.status !== "redirected") next.add(p.id);
      }
    }
    setSelectedIds(next);
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  // Exclude a single page
  async function handleExclude(pageId: string) {
    setLoading(pageId);
    try {
      const res = await fetch("/api/pages/exclude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(json.error ?? "Failed to exclude page");
        return;
      }
      toast.success("Page excluded from monitoring");
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(pageId); return n; });
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(null);
      setExcludeTarget(null);
    }
  }

  // Restore a single page
  async function handleRestore(pageId: string) {
    setLoading(pageId);
    try {
      const res = await fetch("/api/pages/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(json.error ?? "Failed to restore page");
        return;
      }
      toast.success("Page restored to monitoring");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  // Bulk exclude
  async function handleBulkExclude() {
    setLoading("bulk");
    try {
      const res = await fetch("/api/pages/bulk-exclude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageIds: [...selectedIds] }),
      });
      const json = (await res.json()) as { data?: { excluded: number }; error?: string };
      if (!res.ok) {
        toast.error(json.error ?? "Failed to exclude pages");
        return;
      }
      toast.success(`${json.data?.excluded ?? selectedIds.size} pages excluded from monitoring`);
      setSelectedIds(new Set());
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(null);
      setBulkExcludeOpen(false);
    }
  }

  // Add page
  async function handleAddPage() {
    if (!siteId || !addUrl.trim()) return;
    setAddLoading(true);
    try {
      const res = await fetch("/api/pages/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          url: addUrl.trim(),
          title: addTitle.trim() || undefined,
          primaryKeyword: addKeyword.trim() || undefined,
        }),
      });
      const json = (await res.json()) as { data?: { id: string }; error?: string };
      if (!res.ok) {
        toast.error(json.error ?? "Failed to add page");
        return;
      }
      toast.success("Page added to monitoring");
      setAddPageOpen(false);
      setAddUrl("");
      setAddTitle("");
      setAddKeyword("");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setAddLoading(false);
    }
  }

  const excludedCount = pages.filter((p) => p.status === "excluded").length;

  const columns: { key: SortKey; label: string; className: string }[] = [
    { key: "status", label: "Status", className: "w-[100px]" },
    { key: "current_clicks_28d", label: "Clicks (28d)", className: "w-[110px] text-right" },
    { key: "peak_clicks_monthly", label: "Peak", className: "w-[90px] text-right" },
    { key: "decay_score", label: "Decay %", className: "w-[100px] text-right" },
    { key: "decay_velocity_7d", label: "Velocity", className: "w-[100px] text-right" },
  ];

  return (
    <div className="space-y-3">
      {/* Toolbar: Search + filters + Add page */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative max-w-sm flex-1">
            <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by URL..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full h-10 pl-9 pr-9 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Show excluded toggle */}
          {excludedCount > 0 && (
            <button
              onClick={() => { setShowExcluded(!showExcluded); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                showExcluded
                  ? "bg-[#F3F4F6] border-[#D1D5DB] text-[#111827]"
                  : "bg-white border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#D1D5DB]"
              }`}
            >
              <EyeOff size={14} strokeWidth={1.5} />
              {showExcluded ? `Excluded (${excludedCount})` : `Show excluded (${excludedCount})`}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-lg p-1 overflow-x-auto">
            {SORT_PRESETS.map((preset) => (
              <button
                key={preset.key}
                onClick={() => applyPreset(preset.key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                  activePreset === preset.key
                    ? "bg-white text-[#111827] shadow-sm"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Add page button */}
          {siteId && (
            <button
              onClick={() => setAddPageOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors whitespace-nowrap"
            >
              <Plus size={14} strokeWidth={1.5} />
              Add page
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="w-[40px] px-3 py-3">
                  <Checkbox
                    checked={allOnPageSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all on page"
                  />
                </th>
                <th className="text-left px-3 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider">
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
                <th className="w-[100px] px-3 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wider text-right">
                  Last Diagnosis
                </th>
                <th className="w-[44px] px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((page) => {
                const isExcluded = page.status === "excluded";
                const isSelected = selectedIds.has(page.id);

                return (
                  <tr
                    key={page.id}
                    className={`border-b border-[#F3F4F6] transition-colors duration-150 ${
                      isExcluded ? "opacity-50" : "hover:bg-[#F9FAFB]"
                    } ${isSelected ? "bg-[#EFF6FF]" : ""}`}
                  >
                    <td className="px-3 py-3">
                      {!isExcluded && page.status !== "redirected" && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(page.id)}
                          aria-label={`Select ${page.path}`}
                        />
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/pages/${page.id}`}
                        className="text-sm text-[#111827] hover:text-[#3B82F6] truncate block max-w-[200px] sm:max-w-[400px]"
                        style={{ fontFamily: "var(--font-mono, monospace)" }}
                      >
                        {page.path}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={page.status} />
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
                            timeZone,
                          })
                        : "Never"
                      }
                    </td>
                    <td className="px-2 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
                          aria-label="Page actions"
                        >
                          <MoreHorizontal size={16} strokeWidth={1.5} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          {isExcluded ? (
                            <DropdownMenuItem
                              onClick={() => handleRestore(page.id)}
                              disabled={loading === page.id}
                            >
                              <Eye size={14} strokeWidth={1.5} className="mr-2" />
                              Restore to monitoring
                            </DropdownMenuItem>
                          ) : (
                            <>
                              <DropdownMenuItem
                                onClick={() => router.push(`/pages/${page.id}`)}
                              >
                                <Sparkles size={14} strokeWidth={1.5} className="mr-2 text-[#7C3AED]" />
                                <span className="text-[#7C3AED]">Analyze</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setExcludeTarget(page)}
                                disabled={loading === page.id}
                              >
                                <EyeOff size={14} strokeWidth={1.5} className="mr-2" />
                                Exclude from monitoring
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-sm text-[#6B7280]">
                    {search ? "No pages match your search. Try a different URL or keyword." : "No pages found. Run the engine to process your data."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with pagination */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
          <p className="text-xs text-[#9CA3AF]">
            {filtered.length === 0
              ? "0 pages"
              : `${(safeCurrentPage - 1) * PAGE_SIZE + 1}–${Math.min(safeCurrentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} pages`
            }
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>
              <span className="text-xs text-[#6B7280] px-2 tabular-nums">
                {safeCurrentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={16} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk selection toolbar — fixed bottom */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#111827] text-white rounded-xl px-6 py-3 shadow-2xl flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <button
            onClick={() => setBulkExcludeOpen(true)}
            disabled={loading === "bulk"}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <EyeOff size={14} strokeWidth={1.5} />
            Exclude {selectedIds.size} pages
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Exclude confirmation dialog */}
      <AlertDialog open={!!excludeTarget} onOpenChange={(open) => { if (!open) setExcludeTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exclude page from monitoring?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-mono text-xs break-all">{excludeTarget?.path}</span>
              <br /><br />
              This page will be hidden from your dashboard, excluded from Health Score calculations,
              and won&apos;t count toward your plan limit. You can restore it anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => excludeTarget && handleExclude(excludeTarget.id)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
            >
              Exclude
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk exclude confirmation */}
      <AlertDialog open={bulkExcludeOpen} onOpenChange={setBulkExcludeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exclude {selectedIds.size} pages?</AlertDialogTitle>
            <AlertDialogDescription>
              These pages will be hidden from your dashboard and excluded from Health Score calculations.
              You can restore them individually anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkExclude}
              disabled={loading === "bulk"}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
            >
              {loading === "bulk" ? "Excluding..." : `Exclude ${selectedIds.size} pages`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add page dialog */}
      <Dialog open={addPageOpen} onOpenChange={setAddPageOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add page to monitoring</DialogTitle>
            <DialogDescription>
              Add a page that wasn&apos;t imported from GSC. GSC data will sync automatically if available.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-[#111827] mb-1.5 block">URL</label>
              <input
                type="url"
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
                placeholder={siteDomain ? `https://${siteDomain}/page-slug` : "https://yourdomain.com/page-slug"}
                className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#111827] mb-1.5 block">
                Title <span className="text-[#9CA3AF] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                placeholder="Page title"
                className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#111827] mb-1.5 block">
                Primary keyword <span className="text-[#9CA3AF] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={addKeyword}
                onChange={(e) => setAddKeyword(e.target.value)}
                placeholder="Primary keyword"
                className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
            <p className="text-xs text-[#9CA3AF]">
              The page will be included in monitoring. GSC data will sync automatically if available.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => setAddPageOpen(false)}
              className="h-9 px-4 rounded-lg border border-[#E5E7EB] text-sm font-medium text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPage}
              disabled={!addUrl.trim() || addLoading}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addLoading ? "Adding..." : "Add page"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
