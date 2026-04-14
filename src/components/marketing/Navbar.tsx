"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { COMPARISON_NAV_ITEMS } from "@/lib/comparison-nav";

type ResourceLink = {
  label: string;
  href: string;
};

type ResourceSection = {
  title: string;
  items: ResourceLink[];
  footerLink?: ResourceLink;
};

const RESOURCE_SECTIONS: ResourceSection[] = [
  {
    title: "Compare",
    items: COMPARISON_NAV_ITEMS.map((c) => ({
      label: `vs ${c.name}`,
      href: `/vs/${c.slug}`,
    })),
    footerLink: { label: "All comparisons", href: "/vs" },
  },
  {
    title: "Tools",
    items: [
      { label: "Decay Calculator", href: "/tools/decay-calculator" },
      { label: "Refresh Checklist", href: "/resources/content-decay-checklist" },
    ],
  },
  {
    title: "Learn",
    items: [
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/about" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setResourcesOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setResourcesOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeout.current = setTimeout(() => setResourcesOpen(false), 150);
  }, []);

  const closeAll = useCallback(() => {
    setResourcesOpen(false);
    setMobileOpen(false);
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
        className={`h-[72px] flex items-center justify-between px-6 lg:px-12 transition-all duration-300 border-b ${
          scrolled
            ? "bg-[#07090F]/95 border-[#1E293B]/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            : "bg-[#07090F]/60 border-[#1E293B]/25"
        }`}
        style={{ backdropFilter: "blur(24px)" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-extrabold tracking-tight text-white no-underline text-[22px] lg:text-[26px]"
          style={{ letterSpacing: "-0.5px" }}
        >
          Serp<span className="text-[#3B82F6]">Vive</span>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          <a
            href="/#features"
            className="text-[16px] font-medium text-[#CBD5E1] hover:text-white transition-colors no-underline"
            style={{ letterSpacing: "0.01em" }}
          >
            Features
          </a>
          <a
            href="/#pricing"
            className="text-[16px] font-medium text-[#CBD5E1] hover:text-white transition-colors no-underline"
            style={{ letterSpacing: "0.01em" }}
          >
            Pricing
          </a>

          {/* Resources Dropdown (hover on desktop) */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className="flex items-center gap-1.5 text-[16px] font-medium text-[#CBD5E1] hover:text-white transition-colors"
              style={{ letterSpacing: "0.01em" }}
            >
              Resources
              <ChevronDown
                size={15}
                strokeWidth={1.5}
                className={`transition-transform duration-200 ${resourcesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Simplified Dropdown Panel */}
            <div
              className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 w-max rounded-xl border border-[#1E293B] shadow-xl overflow-hidden transition-all duration-200 ${
                resourcesOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
              style={{ background: "#0F172A" }}
            >
              <div className="grid grid-cols-3 gap-12 p-6">
                {RESOURCE_SECTIONS.map((section) => (
                  <div key={section.title}>
                    <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                      {section.title}
                    </p>
                    <div className="flex flex-col gap-3">
                      {section.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeAll}
                          className="text-[15px] font-medium text-[#E2E8F0] hover:text-white no-underline transition-colors whitespace-nowrap"
                        >
                          {item.label}
                        </Link>
                      ))}
                      {section.footerLink && (
                        <Link
                          href={section.footerLink.href}
                          onClick={closeAll}
                          className="mt-2 pt-3 border-t border-[#1E293B] inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#3B82F6] hover:text-[#60A5FA] no-underline transition-colors whitespace-nowrap"
                        >
                          {section.footerLink.label}
                          <ArrowRight size={13} strokeWidth={2} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/blog"
            className="text-[16px] font-medium text-[#CBD5E1] hover:text-white transition-colors no-underline"
            style={{ letterSpacing: "0.01em" }}
          >
            Blog
          </Link>
        </div>

        {/* ── Right side (desktop CTA + mobile hamburger) ── */}
        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="hidden lg:inline-flex text-[16px] font-medium text-[#CBD5E1] hover:text-white transition-colors no-underline"
            style={{ letterSpacing: "0.01em" }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="hidden lg:inline-flex items-center rounded-lg bg-[#2563EB] !text-white font-semibold px-6 py-2.5 text-[15px] hover:bg-[#1D4ED8] transition-all no-underline hover:shadow-[0_0_30px_rgba(37,99,235,0.15)]"
            onClick={() => posthog.capture("cta_clicked", { location: "nav" })}
          >
            <span className="hidden xl:inline">Get Started Free</span>
            <span className="xl:hidden">Start Free</span>
          </Link>

          {/* Hamburger (mobile + tablet) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50 transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X size={22} strokeWidth={1.5} />
            ) : (
              <Menu size={22} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <div
        className={`lg:hidden fixed inset-0 z-[99] transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ top: bannerVisible ? "108px" : "72px" }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60" onClick={closeAll} />

        {/* Panel */}
        <div
          className={`absolute top-0 right-0 w-full max-w-sm h-full overflow-y-auto transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ background: "#0C0F18" }}
        >
          <div className="flex flex-col p-6 gap-1">
            {/* Main links */}
            <a
              href="/#features"
              onClick={closeAll}
              className="py-3 px-3 text-[15px] font-medium text-[#E2E8F0] hover:bg-[#1E293B]/50 rounded-lg no-underline transition-colors"
            >
              Features
            </a>
            <a
              href="/#pricing"
              onClick={closeAll}
              className="py-3 px-3 text-[15px] font-medium text-[#E2E8F0] hover:bg-[#1E293B]/50 rounded-lg no-underline transition-colors"
            >
              Pricing
            </a>
            <Link
              href="/blog"
              onClick={closeAll}
              className="py-3 px-3 text-[15px] font-medium text-[#E2E8F0] hover:bg-[#1E293B]/50 rounded-lg no-underline transition-colors"
            >
              Blog
            </Link>

            {/* Resource sections (grouped text links) */}
            {RESOURCE_SECTIONS.map((section) => (
              <div key={section.title} className="mt-4">
                <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider px-3 py-2">
                  {section.title}
                </p>
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeAll}
                    className="block py-3 px-3 text-[15px] font-medium text-[#E2E8F0] hover:bg-[#1E293B]/50 rounded-lg no-underline transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                {section.footerLink && (
                  <Link
                    href={section.footerLink.href}
                    onClick={closeAll}
                    className="flex items-center gap-1.5 py-3 px-3 text-[14px] font-semibold text-[#3B82F6] hover:bg-[#1E293B]/50 rounded-lg no-underline transition-colors"
                  >
                    {section.footerLink.label}
                    <ArrowRight size={13} strokeWidth={2} />
                  </Link>
                )}
              </div>
            ))}

            {/* Divider + Auth */}
            <div className="border-t border-[#1E293B] mt-4 pt-4 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={closeAll}
                className="py-3 px-3 text-[15px] font-medium text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50 rounded-lg no-underline transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => {
                  closeAll();
                  posthog.capture("cta_clicked", { location: "mobile_nav" });
                }}
                className="flex items-center justify-center rounded-lg bg-[#2563EB] !text-white font-semibold py-3 px-6 text-[15px] no-underline hover:bg-[#1D4ED8] transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
