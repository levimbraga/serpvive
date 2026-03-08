"use client";

import { useState, type FormEvent } from "react";
import { useWaitlist } from "@/hooks/use-waitlist";

export default function FinalCTA() {
  const [email, setEmail] = useState("");
  const waitlist = useWaitlist();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email) waitlist.submit(email, "final-cta");
  }

  return (
    <section
      id="waitlist"
      className="relative overflow-hidden px-5 py-[100px] text-center sm:px-[48px]"
      style={{ background: "#0C0F18" }}
    >
      {/* Center glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)" }}
      />

      <div className="relative z-[1] mx-auto max-w-[600px]">
        <h2 className="mb-[12px] text-[32px] font-[800] leading-[1.1] tracking-[-1px] sm:text-[44px] sm:tracking-[-2px]">
          Your content is decaying right now.
          <br />
          <span className="text-[#475569]">Do you know which posts?</span>
        </h2>
        <p className="mb-[36px] text-[16px] text-[#94A3B8]">
          Join the waitlist. Be first to revive your rankings.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mb-[16px] flex flex-col justify-center gap-[12px] sm:flex-row"
        >
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-[52px] w-full max-w-full rounded-[8px] border border-[#1E293B] bg-[#0F1219] px-[20px] font-sans text-[15px] text-[#F1F5F9] outline-none transition-all duration-200 placeholder:text-[#475569] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] sm:max-w-[300px]"
          />
          <button
            type="submit"
            disabled={waitlist.status === "loading"}
            className="flex h-[52px] items-center justify-center gap-[8px] whitespace-nowrap rounded-[8px] bg-[#3B82F6] px-[28px] font-sans text-[15px] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#2563EB] hover:shadow-[0_8px_40px_rgba(59,130,246,0.15)] disabled:opacity-50"
          >
            {waitlist.status === "loading" ? "Joining..." : "Join Waitlist →"}
          </button>
        </form>

        {waitlist.status === "success" && (
          <p className="mb-3 text-[14px] font-medium text-[#22C55E]">{waitlist.message}</p>
        )}
        {waitlist.status === "error" && (
          <p className="mb-3 text-[14px] font-medium text-[#EF4444]">{waitlist.message}</p>
        )}

        <div className="text-[13px] text-[#F97316]">
          🔥 Early subscribers get 14-day trial (instead of 7)
        </div>

        {/* Trust */}
        <div className="mt-[16px] flex flex-wrap justify-center gap-[20px]">
          {["No spam", "Cancel anytime", "First diagnosis free"].map((text) => (
            <span key={text} className="flex items-center gap-[6px] text-[13px] text-[#64748B]">
              <span className="text-[12px] font-bold text-[#3B82F6]">✓</span>
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
