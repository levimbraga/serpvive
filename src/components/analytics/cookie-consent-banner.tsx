"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "serpvive-cookie-consent";

type Consent = "granted" | "denied";

function updateGtagConsent(consent: Consent) {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag("consent", "update", {
      analytics_storage: consent,
    });
  }
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
      return;
    }
    // Re-apply stored consent on every page load
    if (stored === "granted") {
      updateGtagConsent("granted");
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "granted");
    updateGtagConsent("granted");
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem(STORAGE_KEY, "denied");
    updateGtagConsent("denied");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div
        className="mx-auto max-w-lg pointer-events-auto rounded-xl border border-[#1E293B] px-5 py-4 shadow-2xl backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
        style={{ background: "rgba(10, 14, 26, 0.95)" }}
      >
        <p className="text-[13px] text-[#94A3B8] leading-relaxed flex-1">
          We use cookies for analytics.{" "}
          <a
            href="/cookie-policy"
            className="text-[#3B82F6] hover:underline"
          >
            Learn more
          </a>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleDecline}
            className="rounded-lg px-4 py-1.5 text-[13px] font-medium text-[#94A3B8] hover:text-white border border-[#1E293B] hover:border-[#334155] transition-colors cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="rounded-lg px-4 py-1.5 text-[13px] font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] transition-colors cursor-pointer"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
