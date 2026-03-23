"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import posthog from "posthog-js";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      {/* ── Announcement Bar ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          bannerVisible ? "max-h-9 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className="h-9 flex items-center justify-center gap-3 px-4 text-[13px] text-white relative"
          style={{ background: "linear-gradient(90deg, #3B82F6, #7C3AED)" }}
        >
          <span className="hidden sm:inline-flex items-center gap-2">
            <span className="bg-white/20 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded">New</span>
            AI diagnosis now includes competitor micro-drafts
          </span>
          <span className="sm:hidden text-xs">AI micro-drafts now available</span>
          <Link
            href="/signup"
            className="font-semibold hover:opacity-80 transition-opacity"
            onClick={() => posthog.capture("cta_clicked", { location: "announcement" })}
          >
            Try free &rarr;
          </Link>
          <button
            onClick={() => setBannerVisible(false)}
            className="absolute right-3 text-white/60 hover:text-white text-lg leading-none transition-colors"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      </div>

      {/* ── Main Navigation ── */}
      <nav
        className={`h-[68px] flex items-center justify-between px-6 sm:px-12 transition-all duration-300 border-b ${
          scrolled
            ? "bg-[#07090F]/95 border-[#1E293B]/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            : "bg-[#07090F]/60 border-[#1E293B]/25"
        }`}
        style={{ backdropFilter: "blur(24px)" }}
      >
        <Link href="/" className="font-extrabold tracking-tight text-white no-underline" style={{ fontSize: "clamp(20px, 1.8vw, 28px)", letterSpacing: "-0.5px" }}>
          Serp<span className="text-[#3B82F6]">Vive</span>
        </Link>

        <div className="hidden md:flex items-center gap-9">
          <a href="/#features" className="font-medium text-[#94A3B8] hover:text-white transition-colors no-underline" style={{ fontSize: "clamp(14px, 1.1vw, 17px)" }}>Features</a>
          <a href="/#pricing" className="font-medium text-[#94A3B8] hover:text-white transition-colors no-underline" style={{ fontSize: "clamp(14px, 1.1vw, 17px)" }}>Pricing</a>
          <Link href="/blog" className="font-medium text-[#94A3B8] hover:text-white transition-colors no-underline" style={{ fontSize: "clamp(14px, 1.1vw, 17px)" }}>Blog</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:inline-flex font-medium text-[#94A3B8] hover:text-white transition-colors no-underline"
            style={{ fontSize: "clamp(14px, 1.1vw, 17px)" }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center rounded-lg bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition-all no-underline hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
            style={{ fontSize: "clamp(14px, 1.1vw, 17px)", padding: "clamp(8px, 0.8vw, 12px) clamp(20px, 1.8vw, 28px)" }}
            onClick={() => posthog.capture("cta_clicked", { location: "nav" })}
          >
            Get Started Free
          </Link>
        </div>
      </nav>
    </div>
  );
}
