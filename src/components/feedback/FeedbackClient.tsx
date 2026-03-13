"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, MessageSquare } from "lucide-react";

export default function FeedbackClient({ email, plan }: { email: string; plan: string }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function handleSubmit() {
    if (!message.trim()) return;
    setStatus("sending");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!res.ok) throw new Error();
      setStatus("sent");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">Send Feedback</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Tell us what you think, report a bug, or suggest a feature.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        {status === "sent" ? (
          <div className="text-center py-8">
            <CheckCircle2 size={40} strokeWidth={1.5} className="text-[#16A34A] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#111827]">Thank you for your feedback!</p>
            <p className="text-xs text-[#6B7280] mt-1">We read every message and will get back to you if needed.</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors"
            >
              Send another
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={16} strokeWidth={1.5} className="text-[#6B7280]" />
              <span className="text-sm text-[#6B7280]">From: {email} ({plan} plan)</span>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's on your mind? Bug reports, feature requests, or general feedback..."
              rows={6}
              className="w-full px-3 py-2 text-sm text-[#111827] border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent resize-y"
            />

            {status === "error" && (
              <p className="text-sm text-[#DC2626] mt-2">Failed to send. Please try again.</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!message.trim() || status === "sending"}
              className="mt-3 w-full h-10 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === "sending" ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : null}
              Send Feedback
            </button>
          </>
        )}
      </div>
    </div>
  );
}
