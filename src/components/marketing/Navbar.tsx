"use client";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] flex h-[68px] items-center justify-between px-4 sm:px-[48px] backdrop-blur-[24px]"
      style={{
        background: "rgba(7,9,15,0.85)",
        borderBottom: "1px solid rgba(30,41,59,0.4)",
      }}
    >
      {/* Logo — 26px weight 800, letter-spacing -0.5px */}
      <a href="#" className="text-[26px] font-[800] tracking-[-0.5px] text-white no-underline">
        Serp<span className="text-[#3B82F6]">Vive</span>
      </a>

      {/* Links + CTA */}
      <div className="flex items-center gap-[36px]">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="hidden text-[14px] font-medium text-[#94A3B8] no-underline transition-colors duration-200 hover:text-white sm:block"
          >
            {link.label}
          </a>
        ))}
        <a
          href="#waitlist"
          className="rounded-[8px] bg-[#3B82F6] px-[24px] py-[10px] text-[14px] font-semibold text-white no-underline transition-all duration-200 hover:bg-[#2563EB] hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
        >
          Join Waitlist
        </a>
      </div>
    </nav>
  );
}
