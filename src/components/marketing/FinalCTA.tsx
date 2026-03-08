"use client";

import { useWaitlist } from "@/hooks/use-waitlist";

export default function FinalCTA() {
  const { status, message, submit, reset } = useWaitlist();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email") as string;
    if (email) {
      void submit(email, "final-cta");
    }
  }

  return (
    <section
      id="waitlist"
      className="relative overflow-hidden px-5 py-[100px] text-center sm:px-[48px]"
      style={{ background: "#07090F" }}
    >
      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(59,130,246,0.04)_0%,transparent_70%)]" />

      <div className="relative z-[1] mx-auto max-w-[620px]">
        <h2 className="mb-[12px] text-[32px] font-[800] leading-[1.1] tracking-[-2px] text-[#F1F5F9] sm:text-[44px]">
          Your content is decaying right now.
          <br />
          <span className="text-[#475569]">Do you know which posts?</span>
        </h2>
        <p className="mb-[36px] text-[17px] leading-[1.6] text-[#94A3B8]">
          Join the waitlist. Be first to revive your rankings.
        </p>

        {status === "success" ? (
          <div className="mb-[16px]">
            <p className="text-[15px] font-[600] text-[#22C55E]">{message}</p>
            <button
              onClick={reset}
              className="mt-[8px] text-[13px] text-[#64748B] underline"
            >
              Submit another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mb-[16px] flex flex-col items-center justify-center gap-[12px] sm:flex-row">
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              required
              className="h-[52px] w-full rounded-[8px] border border-[#1E293B] bg-[#0F1219] px-[20px] text-[15px] text-[#F1F5F9] outline-none transition-all duration-200 placeholder:text-[#475569] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] sm:w-[300px]"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="h-[52px] w-full whitespace-nowrap rounded-[8px] bg-[#3B82F6] px-[28px] text-[15px] font-[600] text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#2563EB] hover:shadow-[0_8px_40px_rgba(59,130,246,0.15)] disabled:opacity-60 sm:w-auto"
            >
              {status === "loading" ? "Joining..." : "Join Waitlist →"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mb-[8px] text-[13px] text-[#EF4444]">{message}</p>
        )}

        <div className="mt-[8px] text-[13px] text-[#F97316]">
          🔥 Early subscribers get 14-day trial (instead of 7)
        </div>

        <div className="mt-[16px] flex flex-wrap justify-center gap-3 sm:gap-[20px]">
          <span className="flex items-center gap-[6px] text-[13px] text-[#64748B]">
            <span className="text-[12px] font-[700] text-[#3B82F6]">✓</span>
            No spam
          </span>
          <span className="flex items-center gap-[6px] text-[13px] text-[#64748B]">
            <span className="text-[12px] font-[700] text-[#3B82F6]">✓</span>
            Cancel anytime
          </span>
          <span className="flex items-center gap-[6px] text-[13px] text-[#64748B]">
            <span className="text-[12px] font-[700] text-[#3B82F6]">✓</span>
            First diagnosis free
          </span>
        </div>
      </div>
    </section>
  );
}
