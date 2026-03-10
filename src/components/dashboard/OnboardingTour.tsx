"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";

const STORAGE_KEY = "serpvive_tour_seen";
const TOOLTIP_HEIGHT = 220; // approximate max tooltip height
const TOOLTIP_WIDTH = 280;
const PAD = 8;
const ARROW_SIZE = 8;

type TourStep = {
  targetSelector: string;
  title: string;
  description: string;
};

const STEPS: TourStep[] = [
  {
    targetSelector: "[data-tour='health-score']",
    title: "Health Score",
    description:
      "This is your blog's Health Score. It updates daily based on how your content is performing. Green is good, red needs attention.",
  },
  {
    targetSelector: "[data-tour='decay-list']",
    title: "Pages by Urgency",
    description:
      "These are your pages sorted by urgency. Red pages are losing traffic fast. Click \"Diagnose\" to find out why.",
  },
  {
    targetSelector: "[data-tour='usage-meter']",
    title: "AI Diagnoses",
    description:
      "You have a set number of diagnoses per month. Each one uses AI to analyze your page against top Google competitors.",
  },
];

type TooltipPlacement = "top" | "bottom" | "left" | "right";

function computePlacement(rect: DOMRect): { placement: TooltipPlacement; style: React.CSSProperties } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Try bottom first
  if (rect.bottom + PAD + ARROW_SIZE + TOOLTIP_HEIGHT < vh) {
    return {
      placement: "bottom",
      style: {
        top: rect.bottom + PAD + ARROW_SIZE,
        left: clampX(rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2, vw),
      },
    };
  }

  // Try top
  if (rect.top - PAD - ARROW_SIZE - TOOLTIP_HEIGHT > 0) {
    return {
      placement: "top",
      style: {
        top: rect.top - PAD - ARROW_SIZE - TOOLTIP_HEIGHT,
        left: clampX(rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2, vw),
      },
    };
  }

  // Try left
  if (rect.left - PAD - ARROW_SIZE - TOOLTIP_WIDTH > 0) {
    return {
      placement: "left",
      style: {
        top: clampY(rect.top + rect.height / 2 - TOOLTIP_HEIGHT / 2, vh),
        left: rect.left - PAD - ARROW_SIZE - TOOLTIP_WIDTH,
      },
    };
  }

  // Fallback: right
  return {
    placement: "right",
    style: {
      top: clampY(rect.top + rect.height / 2 - TOOLTIP_HEIGHT / 2, vh),
      left: Math.min(rect.right + PAD + ARROW_SIZE, vw - TOOLTIP_WIDTH - 16),
    },
  };
}

function clampX(x: number, vw: number): number {
  return Math.max(16, Math.min(x, vw - TOOLTIP_WIDTH - 16));
}

function clampY(y: number, vh: number): number {
  return Math.max(16, Math.min(y, vh - TOOLTIP_HEIGHT - 16));
}

// Limit the highlight rect so it doesn't extend beyond the viewport
function clampRect(rect: DOMRect): { top: number; left: number; width: number; height: number } {
  const maxH = 300; // cap highlight height for very tall elements like decay-list
  const h = Math.min(rect.height, maxH);
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: h,
  };
}

export default function OnboardingTour() {
  const [step, setStep] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-start on first visit
  useEffect(() => {
    if (!mounted) return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) return;

    const timer = setTimeout(() => {
      const el = document.querySelector(STEPS[0]!.targetSelector);
      if (el) {
        setStep(0);
        setRect(el.getBoundingClientRect());
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [mounted]);

  const updateRect = useCallback((s: number) => {
    if (s < 0 || s >= STEPS.length) return;
    const el = document.querySelector(STEPS[s]!.targetSelector);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (step < 0) return;
    updateRect(step);

    const handleUpdate = () => updateRect(step);
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [step, updateRect]);

  function startTour() {
    const el = document.querySelector(STEPS[0]!.targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        setStep(0);
        updateRect(0);
      }, 400);
    }
  }

  function next() {
    if (step < STEPS.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
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

  if (!mounted) return null;

  const isActive = step >= 0 && rect !== null;

  return (
    <>
      {/* Help button — always visible to replay tour */}
      <button
        onClick={startTour}
        title="Take a tour"
        className="fixed bottom-5 right-5 z-50 w-10 h-10 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-lg flex items-center justify-center transition-colors"
      >
        <HelpCircle size={20} strokeWidth={1.5} />
      </button>

      {/* Tour overlay */}
      {isActive && createPortal(
        <TourOverlay
          step={step}
          rect={rect}
          tooltipRef={tooltipRef}
          onNext={next}
          onFinish={finish}
        />,
        document.body,
      )}
    </>
  );
}

function TourOverlay({
  step,
  rect,
  tooltipRef,
  onNext,
  onFinish,
}: {
  step: number;
  rect: DOMRect;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  onNext: () => void;
  onFinish: () => void;
}) {
  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;
  const cr = clampRect(rect);
  const { placement, style: tooltipStyle } = computePlacement(
    new DOMRect(cr.left, cr.top, cr.width, cr.height),
  );

  // Arrow position relative to tooltip
  const arrowElement = (() => {
    switch (placement) {
      case "bottom":
        return (
          <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-[#E5E7EB] rotate-45" />
        );
      case "top":
        return (
          <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-[#E5E7EB] rotate-45" />
        );
      case "left":
        return (
          <div className="absolute top-1/2 -right-[6px] -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-[#E5E7EB] rotate-45" />
        );
      case "right":
        return (
          <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-[#E5E7EB] rotate-45" />
        );
    }
  })();

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={cr.left - PAD}
              y={cr.top - PAD}
              width={cr.width + PAD * 2}
              height={cr.height + PAD * 2}
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
          onClick={onFinish}
        />
      </svg>

      {/* Highlight border */}
      <div
        className="absolute rounded-xl border-2 border-[#0D9488] pointer-events-none"
        style={{
          top: cr.top - PAD,
          left: cr.left - PAD,
          width: cr.width + PAD * 2,
          height: cr.height + PAD * 2,
        }}
      />

      {/* Tooltip — always within viewport */}
      <div
        ref={tooltipRef}
        className="fixed bg-white rounded-xl shadow-2xl border border-[#E5E7EB] p-5 z-[10000]"
        style={{ ...tooltipStyle, width: TOOLTIP_WIDTH }}
      >
        {arrowElement}

        <p className="text-xs font-semibold text-[#0D9488] uppercase tracking-wider mb-1">
          {step + 1} of {STEPS.length}
        </p>
        <p className="text-sm font-semibold text-[#111827] mb-2">{current.title}</p>
        <p className="text-sm text-[#4B5563] leading-relaxed mb-4">{current.description}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={onFinish}
            className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={onNext}
            className="text-sm font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] px-4 py-1.5 rounded-lg transition-colors"
          >
            {isLast ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
