"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function RunEngineButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleRun() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/engine/run", { method: "POST" });
      const json = (await res.json()) as { data?: unknown; error?: string };

      if (!res.ok) {
        setError(json.error ?? "Failed to run engine");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleRun}
        disabled={loading}
        className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw size={16} strokeWidth={1.5} className={loading ? "animate-spin" : ""} />
        {loading ? "Running..." : "Run Engine"}
      </button>
      {error && <p className="text-xs text-[#DC2626] mt-2">{error}</p>}
    </div>
  );
}
