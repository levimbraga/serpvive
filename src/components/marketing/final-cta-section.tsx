"use client";

import { ArrowRight, Flame, Shield, Clock, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useWaitlist } from "@/hooks/use-waitlist";

export default function FinalCTASection() {
  const [email, setEmail] = useState("");
  const waitlist = useWaitlist();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email) waitlist.submit(email, "final-cta");
  }

  return (
    <section className="relative overflow-hidden py-28" id="waitlist">
      {/* Background with teal gradient undertone */}
      <div className="absolute inset-0 bg-[#0A0E1A]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0D9488]/[0.03] to-transparent" />
      {/* Teal glow center */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0D9488]/[0.04] blur-[120px]" />
      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      <div className="relative mx-auto max-w-[640px] px-6 text-center">
        <h2 className="text-[28px] font-extrabold tracking-[-0.02em] text-white sm:text-[36px] lg:text-[40px]">
          Your content is decaying right now.
        </h2>
        <p className="mt-3 text-[20px] font-medium text-[#94A3B8]">
          Do you know which posts?
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 flex max-w-[480px] flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-[52px] flex-1 rounded-lg border border-[#1E293B] bg-[#111827] px-4 text-[14px] text-white placeholder:text-[#475569] transition-all focus:border-[#0D9488]/50 focus:outline-none focus:shadow-[0_0_20px_rgba(13,148,136,0.1)]"
          />
          <button
            type="submit"
            disabled={waitlist.status === "loading"}
            className="group flex h-[52px] items-center justify-center gap-2 rounded-lg bg-[#0D9488] px-8 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#0F766E] hover:shadow-[0_0_30px_rgba(13,148,136,0.3)] hover:-translate-y-[1px] disabled:opacity-50"
          >
            {waitlist.status === "loading" ? (
              "Joining..."
            ) : (
              <>
                Join the Waitlist
                <ArrowRight
                  size={16}
                  strokeWidth={2}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>
        </form>

        {waitlist.status === "success" && (
          <p className="mt-4 text-[14px] font-medium text-[#16A34A]">{waitlist.message}</p>
        )}
        {waitlist.status === "error" && (
          <p className="mt-4 text-[14px] font-medium text-[#DC2626]">{waitlist.message}</p>
        )}

        {/* Early bonus */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <Flame size={16} strokeWidth={1.5} className="text-[#D97706]" />
          <span className="text-[14px] text-[#94A3B8]">
            Early subscribers get <span className="font-bold text-white">14-day trial</span>{" "}
            (instead of 7)
          </span>
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
          {[
            { icon: Clock, text: "7-day free trial" },
            { icon: Shield, text: "Cancel anytime" },
            { icon: Sparkles, text: "First diagnosis free" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={14} strokeWidth={1.5} className="text-[#0D9488]" />
              <span className="text-[13px] text-[#64748B]">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
