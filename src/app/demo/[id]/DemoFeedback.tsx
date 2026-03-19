"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Loader2, CheckCircle2 } from "lucide-react";

type Props = {
  demoAnalysisId: string;
  pageUrl: string;
  keyword: string;
};

export default function DemoFeedback({ demoAnalysisId, pageUrl, keyword }: Props) {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "selected" | "sending" | "sent" | "error">("idle");

  async function handleSelect(isHelpful: boolean) {
    setHelpful(isHelpful);
    setStatus("selected");
  }

  async function handleSubmit() {
    setStatus("sending");

    try {
      const res = await fetch("/api/demo/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demoAnalysisId,
          helpful,
          comment: comment.trim() || undefined,
          pageUrl,
          keyword,
        }),
      });

      if (res.status === 409) {
        // Already submitted
        setStatus("sent");
        return;
      }

      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <CheckCircle2 size={18} strokeWidth={1.5} className="text-[#16A34A]" />
          <p className="text-sm font-medium text-[#16A34A]">Thanks for your feedback!</p>
        </div>
        <p className="text-xs text-[#6B7280]">Your input helps us improve our analysis quality.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6">
      <p className="text-sm font-medium text-[#111827] text-center mb-4">
        Was this analysis helpful?
      </p>

      <div className="flex items-center justify-center gap-3 mb-4">
        <button
          onClick={() => handleSelect(true)}
          disabled={status === "sending"}
          className={`flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-medium transition-all ${
            helpful === true
              ? "bg-[#16A34A] text-white"
              : "border border-[#E5E7EB] text-[#374151] hover:border-[#16A34A] hover:text-[#16A34A] bg-white"
          }`}
        >
          <ThumbsUp size={16} strokeWidth={1.5} />
          Yes, very helpful
        </button>
        <button
          onClick={() => handleSelect(false)}
          disabled={status === "sending"}
          className={`flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-medium transition-all ${
            helpful === false
              ? "bg-[#6B7280] text-white"
              : "border border-[#E5E7EB] text-[#374151] hover:border-[#6B7280] hover:text-[#6B7280] bg-white"
          }`}
        >
          <ThumbsDown size={16} strokeWidth={1.5} />
          Not really
        </button>
      </div>

      {(status === "selected" || status === "sending") && (
        <div className="space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think of the analysis? (optional)"
            rows={3}
            maxLength={2000}
            disabled={status === "sending"}
            className="w-full px-3 py-2 text-sm text-[#111827] border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent resize-none disabled:opacity-50"
          />
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={status === "sending"}
              className="flex items-center gap-2 h-9 px-6 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {status === "sending" && (
                <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
              )}
              Send feedback
            </button>
          </div>
        </div>
      )}

      {status === "error" && (
        <p className="text-xs text-[#DC2626] text-center mt-2">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
