"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";

const STORAGE_KEY = "serpvive_tour_seen";
const TOOLTIP_WIDTH = 280;
const TOOLTIP_EST_HEIGHT = 220; // estimate for placement; actual is measured
const PAD = 8;
const ARROW_GAP = 10;

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

type Placement = "top" | "bottom" | "left" | "right";

type HighlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function getHighlightRect(el: Element): HighlightRect {
  const r = el.getBoundingClientRect();
  // Cap height for very tall elements (e.g. decay list)
  const maxH = Math.min(r.height, 300);
  return { top: r.top, left: r.left, width: r.width, height: maxH };
}

function pickPlacement(hr: HighlightRect, tooltipH: number = TOOLTIP_EST_HEIGHT): Placement {
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  // Prefer bottom
  if (hr.top + hr.height + PAD + ARROW_GAP + tooltipH < vh) return "bottom";
  // Try top
  if (hr.top - PAD - ARROW_GAP - tooltipH > 0) return "top";
  // Try left
  if (hr.left - PAD - ARROW_GAP - TOOLTIP_WIDTH > 0) return "left";
  // Try right
  if (hr.left + hr.width + PAD + ARROW_GAP + TOOLTIP_WIDTH < vw) return "right";
  // Fallback: bottom
  return "bottom";
}

function getTooltipStyle(hr: HighlightRect, placement: Placement, tooltipH: number = TOOLTIP_EST_HEIGHT): React.CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clampX = (x: number) => Math.max(12, Math.min(x, vw - TOOLTIP_WIDTH - 12));
  const clampY = (y: number) => Math.max(12, Math.min(y, vh - tooltipH - 12));

  switch (placement) {
    case "bottom":
      return {
        top: hr.top + hr.height + PAD + ARROW_GAP,
        left: clampX(hr.left + hr.width / 2 - TOOLTIP_WIDTH / 2),
      };
    case "top":
      return {
        top: clampY(hr.top - PAD - ARROW_GAP - tooltipH),
        left: clampX(hr.left + hr.width / 2 - TOOLTIP_WIDTH / 2),
      };
    case "left":
      return {
        top: clampY(hr.top + hr.height / 2 - tooltipH / 2),
        left: hr.left - PAD - ARROW_GAP - TOOLTIP_WIDTH,
      };
    case "right":
      return {
        top: clampY(hr.top + hr.height / 2 - tooltipH / 2),
        left: hr.left + hr.width + PAD + ARROW_GAP,
      };
  }
}

export default function OnboardingTour() {
  const [step, setStep] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [hr, setHr] = useState<HighlightRect | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // rAF loop: continuously track element position while tour is active
  const trackElement = useCallback((s: number) => {
    const loop = () => {
      if (s < 0 || s >= STEPS.length) return;
      const el = document.querySelector(STEPS[s]!.targetSelector);
      if (el) {
        const newHr = getHighlightRect(el);
        setHr((prev) => {
          // Only update state if position actually changed (avoids re-render spam)
          if (
            prev &&
            Math.abs(prev.top - newHr.top) < 0.5 &&
            Math.abs(prev.left - newHr.left) < 0.5 &&
            Math.abs(prev.width - newHr.width) < 0.5 &&
            Math.abs(prev.height - newHr.height) < 0.5
          ) {
            return prev;
          }
          return newHr;
        });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  // Start/stop tracking when step changes
  useEffect(() => {
    if (step < 0) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    trackElement(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [step, trackElement]);

  // Auto-start on first visit
  useEffect(() => {
    if (!mounted) return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) return;

    const timer = setTimeout(() => {
      const el = document.querySelector(STEPS[0]!.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setStep(0), 500);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [mounted]);

  function startTour() {
    const el = document.querySelector(STEPS[0]!.targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setStep(0), 500);
    }
  }

  function goToStep(s: number) {
    setStep(s);
    const el = document.querySelector(STEPS[s]!.targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function next() {
    if (step < STEPS.length - 1) {
      goToStep(step + 1);
    } else {
      finish();
    }
  }

  function finish() {
    localStorage.setItem(STORAGE_KEY, "true");
    cancelAnimationFrame(rafRef.current);
    setStep(-1);
    setHr(null);
  }

  if (!mounted) return null;

  const isActive = step >= 0 && hr !== null;

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
      {isActive &&
        createPortal(
          <TourOverlay step={step} hr={hr} onNext={next} onFinish={finish} />,
          document.body,
        )}
    </>
  );
}

function TourOverlay({
  step,
  hr,
  onNext,
  onFinish,
}: {
  step: number;
  hr: HighlightRect;
  onNext: () => void;
  onFinish: () => void;
}) {
  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [measuredH, setMeasuredH] = useState(TOOLTIP_EST_HEIGHT);

  // Measure actual tooltip height after render
  useEffect(() => {
    if (tooltipRef.current) {
      const h = tooltipRef.current.getBoundingClientRect().height;
      if (h > 0) setMeasuredH(h);
    }
  });

  const placement = pickPlacement(hr, measuredH);
  const tooltipStyle = getTooltipStyle(hr, placement, measuredH);

  const arrow = (() => {
    const base = "absolute w-3 h-3 bg-white";
    switch (placement) {
      case "bottom":
        return <div className={`${base} -top-[6px] left-1/2 -translate-x-1/2 border-l border-t border-[#E5E7EB] rotate-45`} />;
      case "top":
        return <div className={`${base} -bottom-[6px] left-1/2 -translate-x-1/2 border-r border-b border-[#E5E7EB] rotate-45`} />;
      case "left":
        return <div className={`${base} top-1/2 -right-[6px] -translate-y-1/2 border-r border-t border-[#E5E7EB] rotate-45`} />;
      case "right":
        return <div className={`${base} top-1/2 -left-[6px] -translate-y-1/2 border-l border-b border-[#E5E7EB] rotate-45`} />;
    }
  })();

  return (
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: "none" }}>
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="tour-cutout">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={hr.left - PAD}
              y={hr.top - PAD}
              width={hr.width + PAD * 2}
              height={hr.height + PAD * 2}
              rx={12}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.5)"
          mask="url(#tour-cutout)"
          style={{ pointerEvents: "auto", cursor: "pointer" }}
          onClick={onFinish}
        />
      </svg>

      {/* Highlight ring around target */}
      <div
        className="fixed rounded-xl ring-2 ring-[#0D9488] ring-offset-2 pointer-events-none"
        style={{
          top: hr.top,
          left: hr.left,
          width: hr.width,
          height: hr.height,
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed bg-white rounded-xl shadow-2xl border border-[#E5E7EB] p-5"
        style={{ ...tooltipStyle, width: TOOLTIP_WIDTH, pointerEvents: "auto" }}
      >
        {arrow}

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
