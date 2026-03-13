"use client";

import { useState, useEffect, useRef } from "react";
import {
  Zap, Search, FileText, Brain, Sparkles, CheckCircle2, Loader2,
  AlertCircle, Copy, Check, Trash2, ExternalLink, Eye,
} from "lucide-react";

type DemoItem = {
  id: string;
  url: string;
  keyword: string;
  created_at: string;
  expires_at: string;
  views: number;
};

export default function DemoClient() {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [demos, setDemos] = useState<DemoItem[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    fetchDemos();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  async function fetchDemos() {
    const res = await fetch("/api/admin/demo");
    if (res.ok) {
      const json = await res.json();
      setDemos(json.data ?? []);
    }
  }

  async function handleGenerate() {
    if (!url.trim() || !keyword.trim()) return;

    setStatus("loading");
    setError("");
    setLoadingStep(0);
    setElapsedSeconds(0);
    setGeneratedId(null);

    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    const t1 = setTimeout(() => setLoadingStep(1), 15000);
    const t2 = setTimeout(() => setLoadingStep(2), 40000);
    const t3 = setTimeout(() => setLoadingStep(3), 80000);
    timeoutsRef.current = [t1, t2, t3];

    try {
      const res = await fetch("/api/admin/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), keyword: keyword.trim() }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");

      setGeneratedId(json.data.id);
      setStatus("done");
      fetchDemos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      timeoutsRef.current.forEach(clearTimeout);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this demo?")) return;
    await fetch(`/api/admin/demo?id=${id}`, { method: "DELETE" });
    setDemos((prev) => prev.filter((d) => d.id !== id));
  }

  function handleCopyLink(id: string) {
    navigator.clipboard.writeText(`https://serpvive.com/demo/${id}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const STEPS = [
    { icon: Search, label: "Fetching SERP data..." },
    { icon: FileText, label: "Analyzing competitor content..." },
    { icon: Brain, label: "AI is diagnosing..." },
    { icon: Sparkles, label: "Generating refresh brief..." },
  ];

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">Demo Generator</h1>
        <p className="text-sm text-[#6B7280] mt-1">Generate public analyses for Reddit growth hacking.</p>
      </div>

      {/* Generator form */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        {status === "loading" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#111827]">Generating demo...</h3>
              <span className="text-xs text-[#9CA3AF] tabular-nums">{formatTime(elapsedSeconds)}</span>
            </div>
            {STEPS.map(({ icon: Icon, label }, i) => {
              const isDone = i < loadingStep;
              const isActive = i === loadingStep;
              return (
                <div key={i} className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 size={18} strokeWidth={1.5} className="text-[#16A34A]" />
                  ) : isActive ? (
                    <Loader2 size={18} strokeWidth={1.5} className="text-[#7C3AED] animate-spin" />
                  ) : (
                    <Icon size={18} strokeWidth={1.5} className="text-[#D1D5DB]" />
                  )}
                  <span className={`text-sm ${isActive ? "text-[#111827] font-medium" : isDone ? "text-[#6B7280]" : "text-[#D1D5DB]"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : status === "done" && generatedId ? (
          <div className="text-center py-4">
            <CheckCircle2 size={36} strokeWidth={1.5} className="text-[#16A34A] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#111827] mb-2">Demo generated!</p>
            <div className="flex items-center justify-center gap-2 bg-[#F9FAFB] rounded-lg p-3">
              <code className="text-sm text-[#3B82F6]" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                serpvive.com/demo/{generatedId}
              </code>
              <button
                onClick={() => handleCopyLink(generatedId)}
                className="p-1.5 rounded-md hover:bg-[#E5E7EB] text-[#6B7280] transition-colors"
              >
                {copied ? <Check size={14} strokeWidth={1.5} className="text-[#16A34A]" /> : <Copy size={14} strokeWidth={1.5} />}
              </button>
            </div>
            <button
              onClick={() => { setStatus("idle"); setUrl(""); setKeyword(""); }}
              className="mt-4 text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium"
            >
              Generate another
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">URL *</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/blog/post"
                className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Keyword *</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="best project management tools"
                className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              />
            </div>

            {status === "error" && (
              <div className="flex items-start gap-2 bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3">
                <AlertCircle size={16} strokeWidth={1.5} className="text-[#DC2626] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#991B1B]">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!url.trim() || keyword.trim().length < 2}
              className="w-full h-10 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Zap size={16} strokeWidth={1.5} /> Generate Demo Analysis
            </button>
            <p className="text-xs text-[#9CA3AF]">
              Does NOT count against your diagnosis limit. Expires in 21 days.
            </p>
          </div>
        )}
      </div>

      {/* Previous demos */}
      {demos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#111827] mb-3">Previous Demos</h2>
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-[#6B7280] uppercase">URL</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-[#6B7280] uppercase">Keyword</th>
                    <th className="text-center px-4 py-2.5 text-xs font-medium text-[#6B7280] uppercase">Views</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-[#6B7280] uppercase">Expires</th>
                    <th className="w-[100px] px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {demos.map((demo) => (
                    <tr key={demo.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3 text-sm text-[#111827] max-w-[200px] truncate" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                        {new URL(demo.url).pathname}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280] max-w-[150px] truncate">
                        {demo.keyword}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7280] text-center">
                        <span className="inline-flex items-center gap-1">
                          <Eye size={12} strokeWidth={1.5} /> {demo.views}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#9CA3AF] text-right">
                        {new Date(demo.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <a
                            href={`/demo/${demo.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
                            title="View demo"
                          >
                            <ExternalLink size={14} strokeWidth={1.5} />
                          </a>
                          <button
                            onClick={() => handleCopyLink(demo.id)}
                            className="p-1.5 rounded-md hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
                            title="Copy link"
                          >
                            <Copy size={14} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(demo.id)}
                            className="p-1.5 rounded-md hover:bg-[#FEF2F2] text-[#9CA3AF] hover:text-[#DC2626] transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
