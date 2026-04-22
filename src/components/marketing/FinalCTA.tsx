"use client";

import posthog from "posthog-js";
import { Reveal } from "@/hooks/useReveal";
import WaitlistCTA from "./WaitlistCTA";

export default function FinalCTA() {
  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-12 overflow-hidden" id="cta" style={{ background: "#070810" }}>
      {/* Outer glow — wide ambient */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[700px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 65%)",
        }}
      />
      {/* Inner glow — focused behind headline */}
      <div
        className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative mx-auto text-center" style={{ maxWidth: "min(900px, 80vw)" }}>
        <Reveal>
          <h2
            className="font-extrabold leading-[1.08] mb-5"
            style={{ fontSize: "clamp(2rem, 4.2vw, 4rem)", letterSpacing: "-0.04em" }}
          >
            Stop losing traffic{" "}
            <span className="text-[#3B82F6]">you already earned.</span>
          </h2>
        </Reveal>

        <Reveal>
          <p className="text-[16px] sm:text-[20px] text-[#94A3B8] leading-[1.7] max-w-[560px] mx-auto mb-10">
            Your content is decaying right now. SerpVive detects it, explains why, and tells you exactly what to fix.
          </p>
        </Reveal>

        <Reveal>
          <WaitlistCTA
            source="final"
            onClick={() => posthog.capture("cta_clicked", { location: "final" })}
            className="inline-flex items-center gap-2.5 rounded-xl bg-[#3B82F6] text-white font-semibold transition-all duration-200 hover:bg-[#2563EB] hover:shadow-[0_8px_50px_rgba(59,130,246,0.2)] hover:-translate-y-0.5 cursor-pointer"
            style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)", padding: "clamp(14px, 1.5vw, 20px) clamp(28px, 3vw, 48px)" } as React.CSSProperties}
          >
            Join the waitlist
            <span style={{ fontSize: "clamp(18px, 1.4vw, 24px)" }}>&rarr;</span>
          </WaitlistCTA>
        </Reveal>

        <Reveal>
          <p className="text-[14px] sm:text-[16px] text-[#64748B] leading-relaxed mt-6 mb-7">
            Launching in H2 2026 — early members get priority access and a launch discount.
          </p>
        </Reveal>

        <Reveal>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {["No spam", "Unsubscribe anytime", "Launch discount for early members"].map((text) => (
              <span key={text} className="flex items-center gap-1.5 text-[13px] text-[#64748B]">
                <span className="text-[#3B82F6] font-bold text-[12px]">&#x2713;</span>
                {text}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
