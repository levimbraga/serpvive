"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "serpvive_tour_seen";

type TourStep = {
  targetSelector: string;
  title: string;
  description: string;
  position: "bottom" | "right" | "left";
};

const STEPS: TourStep[] = [
  {
    targetSelector: "[data-tour='health-score']",
    title: "Health Score",
    description:
      "This is your blog's Health Score. It updates daily based on how your content is performing. Green is good, red needs attention.",
    position: "bottom",
  },
  {
    targetSelector: "[data-tour='decay-list']",
    title: "Pages by Urgency",
    description:
      "These are your pages sorted by urgency. Red pages are losing traffic fast. Click \"Diagnose\" to find out why.",
    position: "bottom",
  },
  {
    targetSelector: "[data-tour='usage-meter']",
    title: "AI Diagnoses",
    description:
      "You have a set number of diagnoses per month. Each one uses AI to analyze your page against top Google competitors.",
    position: "left",
  },
];

export default function OnboardingTour() {
  const [step, setStep] = useState(-1); // -1 = not started / hidden
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) return;

    // Wait a bit for the dashboard to render
    const timer = setTimeout(() => {
      const el = document.querySelector(STEPS[0]!.targetSelector);
      if (el) {
        setStep(0);
        setRect(el.getBoundingClientRect());
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const updateRect = useCallback((s: number) => {
    if (s < 0 || s >= STEPS.length) return;
    const stepData = STEPS[s]!;
    const el = document.querySelector(stepData.targetSelector);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (step < 0) return;
    updateRect(step);

    const handleScroll = () => updateRect(step);
    const handleResize = () => updateRect(step);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [step, updateRect]);

  function next() {
    if (step < STEPS.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      // Scroll target into view
      const el = document.querySelector(STEPS[nextStep]!.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => updateRect(nextStep), 400);
      }
    } else {
      finish();
    }
  }

  function finish() {
    localStorage.setItem(STORAGE_KEY, "true");
    setStep(-1);
    setRect(null);
  }

  if (step < 0 || !rect) return null;

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;
  const pad = 8;

  // Calculate tooltip position
  let tooltipStyle: React.CSSProperties = {};
  if (current.position === "bottom") {
    tooltipStyle = {
      top: rect.bottom + pad + 12,
      left: rect.left + rect.width / 2,
      transform: "translateX(-50%)",
    };
  } else if (current.position === "left") {
    tooltipStyle = {
      top: rect.top + rect.height / 2,
      left: rect.left - pad - 12,
      transform: "translate(-100%, -50%)",
    };
  } else if (current.position === "right") {
    tooltipStyle = {
      top: rect.top + rect.height / 2,
      left: rect.right + pad + 12,
      transform: "translateY(-50%)",
    };
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={rect.left - pad}
              y={rect.top - pad}
              width={rect.width + pad * 2}
              height={rect.height + pad * 2}
              rx="12"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.5)"
          mask="url(#tour-mask)"
          style={{ pointerEvents: "auto" }}
          onClick={finish}
        />
      </svg>

      {/* Highlight border */}
      <div
        className="absolute rounded-xl border-2 border-[#0D9488] pointer-events-none"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        }}
      />

      {/* Tooltip */}
      <div
        className="absolute bg-white rounded-xl shadow-2xl border border-[#E5E7EB] p-5 max-w-[280px] z-[10000]"
        style={tooltipStyle}
      >
        {/* Arrow */}
        {current.position === "bottom" && (
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-[#E5E7EB] rotate-45"
          />
        )}
        {current.position === "left" && (
          <div
            className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white border-r border-t border-[#E5E7EB] rotate-45"
          />
        )}

        <p className="text-xs font-semibold text-[#0D9488] uppercase tracking-wider mb-1">
          {step + 1} of {STEPS.length}
        </p>
        <p className="text-sm font-semibold text-[#111827] mb-2">{current.title}</p>
        <p className="text-sm text-[#4B5563] leading-relaxed mb-4">{current.description}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={finish}
            className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={next}
            className="text-sm font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] px-4 py-1.5 rounded-lg transition-colors"
          >
            {isLast ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
