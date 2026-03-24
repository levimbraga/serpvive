"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import {
  ChevronDown,
  BarChart3,
  Calculator,
  ClipboardList,
  BookOpen,
  User,
  Sparkles,
  Globe,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ResourceItem = {
  label: string;
  href: string;
  desc: string;
  icon: LucideIcon;
};

type ResourceSection = {
  title: string;
  items: ResourceItem[];
};

const RESOURCE_SECTIONS: ResourceSection[] = [
  {
    title: "Compare",
    items: [
      { label: "vs Semrush", href: "/vs/semrush", desc: "Features, pricing, and honest comparison", icon: BarChart3 },
      { label: "vs Surfer SEO", href: "/vs/surfer-seo", desc: "Content creation vs content protection", icon: BarChart3 },
      { label: "vs Frase", href: "/vs/frase", desc: "Which content decay tool is better", icon: BarChart3 },
    ],
  },
  {
    title: "Tools",
    items: [
      { label: "Decay Calculator", href: "/tools/decay-calculator", desc: "Estimate your monthly traffic loss", icon: Calculator },
      { label: "Refresh Checklist", href: "/resources/content-decay-checklist", desc: "15-step guide to refreshing any post", icon: ClipboardList },
      { label: "Free Analysis", href: "/pages/analyze", desc: "Analyze any URL with AI, no signup", icon: Globe },
    ],
  },
  {
    title: "Learn",
    items: [
      { label: "Blog", href: "/blog", desc: "Articles on SEO and content decay", icon: BookOpen },
      { label: "About", href: "/about", desc: "Our mission and approach", icon: User },
      { label: "Changelog", href: "/changelog", desc: "Latest updates and improvements", icon: Sparkles },
    ],
  },
];

const SECTION_COLORS: Record<string, { iconBg: string; iconColor: string }> = {
  Compare: { iconBg: "#EFF6FF", iconColor: "#2563EB" },
  Tools:   { iconBg: "#F0FDFA", iconColor: "#0D9488" },
  Learn:   { iconBg: "#F5F3FF", iconColor: "#7C3AED" },
};

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

  const linkStyle = { fontSize: "clamp(14px, 1.1vw, 17px)" } as const;

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
        {/* Logo */}
        <Link href="/" className="font-extrabold tracking-tight text-white no-underline" style={{ fontSize: "clamp(20px, 1.8vw, 28px)", letterSpacing: "-0.5px" }}>
          Serp<span className="text-[#3B82F6]">Vive</span>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden md:flex items-center gap-9">
          <a href="/#features" className="font-medium text-[#94A3B8] hover:text-white transition-colors no-underline" style={linkStyle}>Features</a>
          <a href="/#pricing" className="font-medium text-[#94A3B8] hover:text-white transition-colors no-underline" style={linkStyle}>Pricing</a>

          {/* Resources Dropdown (hover on desktop) */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className="flex items-center gap-1 font-medium text-[#94A3B8] hover:text-white transition-colors"
              style={linkStyle}
            >
              Resources
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                className={`transition-transform duration-200 ${resourcesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Mega Dropdown Panel */}
            <div
              className={`absolute top-full mt-3 rounded-2xl border border-[#1E293B] shadow-[0_12px_48px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-200 origin-top ${
                resourcesOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
              style={{
                background: "#0C0F18",
                width: "580px",
                left: "50%",
                transform: "translateX(-50%)",
                backdropFilter: "blur(24px)",
              }}
            >
              <div className="grid grid-cols-3 gap-5 p-5">
                {RESOURCE_SECTIONS.map((section) => {
                  const colors = SECTION_COLORS[section.title] ?? { iconBg: "#F5F3FF", iconColor: "#7C3AED" };
                  return (
                    <div key={section.title} className="flex flex-col">
                      <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                        {section.title}
                      </p>
                      <div className="flex flex-col gap-1">
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeAll}
                            className="flex items-start gap-2.5 px-2.5 py-2.5 rounded-lg no-underline group hover:bg-[#1E293B]/60 transition-colors"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                              style={{ background: colors.iconBg }}
                            >
                              <item.icon
                                size={18}
                                strokeWidth={1.5}
                                style={{ color: colors.iconColor }}
                              />
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold text-[#E2E8F0] group-hover:text-white transition-colors leading-snug">
                                {item.label}
                              </p>
                              <p className="text-[12px] text-[#64748B] group-hover:text-[#94A3B8] leading-snug mt-0.5 transition-colors">
                                {item.desc}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Link href="/blog" className="font-medium text-[#94A3B8] hover:text-white transition-colors no-underline" style={linkStyle}>Blog</Link>
        </div>

        {/* ── Right side (desktop CTA + mobile hamburger) ── */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:inline-flex font-medium text-[#94A3B8] hover:text-white transition-colors no-underline"
            style={linkStyle}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="hidden md:inline-flex items-center rounded-lg bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition-all no-underline hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
            style={{ fontSize: "clamp(14px, 1.1vw, 17px)", padding: "clamp(8px, 0.8vw, 12px) clamp(20px, 1.8vw, 28px)" }}
            onClick={() => posthog.capture("cta_clicked", { location: "nav" })}
          >
            Get Started Free
          </Link>

          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50 transition-colors"
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
        className={`md:hidden fixed inset-0 z-[99] transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ top: bannerVisible ? "105px" : "68px" }}
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

            {/* Resources sections (expanded inline) */}
            {RESOURCE_SECTIONS.map((section) => {
              const colors = SECTION_COLORS[section.title] ?? { iconBg: "#F5F3FF", iconColor: "#7C3AED" };
              return (
                <div key={section.title} className="mt-4">
                  <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider px-3 py-2">
                    {section.title}
                  </p>
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeAll}
                      className="flex items-center gap-3 py-3 px-3 rounded-lg no-underline hover:bg-[#1E293B]/50 transition-colors min-h-[48px]"
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: colors.iconBg }}
                      >
                        <item.icon
                          size={20}
                          strokeWidth={1.5}
                          style={{ color: colors.iconColor }}
                        />
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-[#E2E8F0]">
                          {item.label}
                        </p>
                        <p className="text-[13px] text-[#64748B] leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })}

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
                className="flex items-center justify-center rounded-lg bg-[#3B82F6] text-white font-semibold py-3 px-6 text-[15px] no-underline hover:bg-[#2563EB] transition-all"
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
