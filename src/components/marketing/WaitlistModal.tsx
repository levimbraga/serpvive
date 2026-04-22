"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import posthog from "posthog-js";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
};

type Status = "idle" | "submitting" | "success" | "error";

export default function WaitlistModal({ open, onOpenChange, source = "landing" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Reset state when modal closes so reopening is clean.
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setEmail("");
        setStatus("idle");
        setErrorMessage("");
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string; code?: string };

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      posthog.capture("waitlist_joined", { source });
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0F1219] border border-[#1E293B] ring-0 sm:max-w-[440px] text-white">
        {status === "success" ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} strokeWidth={1.5} className="text-[#22C55E]" />
            </div>
            <DialogTitle className="text-xl font-semibold text-white mb-2">
              You&apos;re on the list
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8] text-[15px] leading-relaxed">
              We&apos;ll email <span className="text-white font-medium">{email}</span> when SerpVive launches in <span className="text-white font-medium">H2 2026</span>.
            </DialogDescription>
            <p className="text-[#64748B] text-sm mt-4">
              Early waitlist members get priority access and a launch discount.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center mb-2">
                <Mail size={22} strokeWidth={1.5} className="text-[#3B82F6]" />
              </div>
              <DialogTitle className="text-xl font-semibold text-white">
                Join the SerpVive waitlist
              </DialogTitle>
              <DialogDescription className="text-[#94A3B8] text-[15px] leading-relaxed">
                SerpVive is launching in <span className="text-white font-medium">H2 2026</span>. Drop your email and we&apos;ll notify you the moment it&apos;s live, plus a launch discount for early members.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <label htmlFor="waitlist-email" className="block text-sm font-medium text-[#94A3B8] mb-2">
                  Email
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "submitting"}
                  className="w-full h-12 px-4 rounded-xl bg-[#07090F] border border-[#1E293B] text-white text-[15px] placeholder:text-[#475569] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors disabled:opacity-50"
                  placeholder="you@company.com"
                />
              </div>

              {status === "error" && errorMessage && (
                <p className="text-sm text-[#EF4444]">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full h-12 rounded-xl bg-[#3B82F6] text-white text-[15px] font-semibold hover:bg-[#2563EB] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join waitlist"
                )}
              </button>

              <p className="text-xs text-[#64748B] text-center">
                No spam. One email when we launch.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
