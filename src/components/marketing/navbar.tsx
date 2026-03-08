"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[#1E293B]/50 backdrop-blur-[20px]"
          : "bg-transparent"
      }`}
      style={scrolled ? { backgroundColor: "rgba(10, 14, 26, 0.8)" } : undefined}
    >
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
        {/* Logo — 24px weight 700 */}
        <a href="#" className="flex items-center text-[24px] font-bold tracking-tight">
          <span className="text-white">Serp</span>
          <span className="text-[#0D9488]">Vive</span>
        </a>

        {/* Desktop links — #94A3B8, hover #FFFFFF */}
        <div className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] font-medium text-[#94A3B8] transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA — bg #0D9488, padding 10px 24px, border-radius 8px */}
        <a
          href="#waitlist"
          className="hidden rounded-[8px] bg-[#0D9488] px-[24px] py-[10px] text-[14px] font-semibold text-white transition-all duration-200 hover:bg-[#0F766E] hover:shadow-[0_0_30px_rgba(13,148,136,0.3)] md:block"
        >
          Join Waitlist
        </a>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[#94A3B8] md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#1E293B]/50 bg-[#0A0E1A] px-6 pb-8 pt-6 md:hidden">
          <div className="flex flex-col gap-5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-[15px] font-medium text-[#94A3B8] transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#waitlist"
              onClick={() => setMobileOpen(false)}
              className="mt-2 block rounded-[8px] bg-[#0D9488] py-3.5 text-center text-[15px] font-semibold text-white"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
