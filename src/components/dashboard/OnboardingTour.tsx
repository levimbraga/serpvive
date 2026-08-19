"use client";

import { useEffect, useCallback, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { HelpCircle } from "lucide-react";

const STORAGE_KEY = "serpvive_tour_seen";

const tourDriver = driver({
  showProgress: true,
  animate: true,
  overlayColor: "rgba(0, 0, 0, 0.5)",
  popoverClass: "serpvive-tour-popover",
  steps: [
    {
      element: "[data-tour='health-score']",
      popover: {
        title: "Health Score",
        description:
          "This is your blog's Health Score. It updates daily based on how your content is performing. Green is good, red needs attention.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "[data-tour='decay-list']",
      popover: {
        title: "Pages by Urgency",
        description:
          'These are your pages sorted by urgency. Red pages are losing traffic fast. Click "Diagnose" to find out why.',
        side: "top",
        align: "center",
      },
    },
    {
      element: "[data-tour='usage-meter']",
      popover: {
        title: "AI Diagnoses",
        description:
          "You have a set number of diagnoses per month. Each one uses AI to analyze your page against top Google competitors.",
        side: "left",
        align: "center",
      },
    },
  ],
  onDestroyed: () => {
    localStorage.setItem(STORAGE_KEY, "true");
  },
});

export default function OnboardingTour() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Next tick: keeps SSR/hydration output stable without a synchronous
    // setState inside the effect body
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  // Auto-start on first visit
  useEffect(() => {
    if (!mounted) return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) return;

    const timer = setTimeout(() => {
      const el = document.querySelector("[data-tour='health-score']");
      if (el) tourDriver.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, [mounted]);

  const startTour = useCallback(() => {
    tourDriver.drive();
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={startTour}
      title="Take a tour"
      className="fixed bottom-5 right-5 z-50 w-10 h-10 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-lg flex items-center justify-center transition-colors"
    >
      <HelpCircle size={20} strokeWidth={1.5} />
    </button>
  );
}
