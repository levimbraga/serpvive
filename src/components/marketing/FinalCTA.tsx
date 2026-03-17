"use client";

import posthog from "posthog-js";
import { Reveal } from "@/hooks/useReveal";

export default function FinalCTA() {
  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-12 overflow-hidden" id="cta">
      {/* Blue glow effect */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative max-w-[700px] mx-auto text-center">
        <Reveal>
          <h2
            className="text-[32px] sm:text-[44px] lg:text-[56px] font-extrabold leading-[1.08] mb-5"
            style={{ letterSpacing: "-0.04em" }}
          >
            Stop losing traffic{" "}
            <span className="text-[#3B82F6]">you already earned.</span>
          </h2>
        </Reveal>

        <Reveal>
          <p className="text-[16px] sm:text-[20px] text-[#94A3B8] leading-[1.7] max-w-[520px] mx-auto mb-10">
            Your content is decaying right now. Do you know which posts?
          </p>
        </Reveal>

        <Reveal>
          <p className="text-[14px] sm:text-[16px] text-[#64748B] leading-relaxed max-w-[480px] mx-auto mb-10">
            Stop guessing. Get AI-powered diagnosis with evidence from your actual SERP competitors.
          </p>
        </Reveal>

        <Reveal>
          <a
            href="/signup"
            onClick={() => posthog.capture("cta_clicked", { location: "final" })}
            className="inline-flex items-center gap-2.5 h-[60px] px-14 rounded-xl bg-[#3B82F6] text-white text-[18px] font-semibold no-underline transition-all duration-200 hover:bg-[#2563EB] hover:shadow-[0_8px_50px_rgba(59,130,246,0.2)] hover:-translate-y-0.5"
          >
            Get Started Free
            <span className="text-[20px]">&rarr;</span>
          </a>
        </Reveal>

        <Reveal>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-7">
            {["No credit card required", "Cancel anytime", "First AI diagnosis included"].map((text) => (
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
