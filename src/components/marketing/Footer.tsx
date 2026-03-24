import Link from "next/link";

const LINKS = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Decay Calculator", href: "/tools/decay-calculator" },
    { label: "Refresh Checklist", href: "/resources/content-decay-checklist" },
  ],
  Compare: [
    { label: "vs Semrush", href: "/vs/semrush" },
    { label: "vs Surfer SEO", href: "/vs/surfer-seo" },
    { label: "vs Frase", href: "/vs/frase" },
    { label: "All Comparisons", href: "/vs" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy", href: "/cookie-policy" },
  ],
  Connect: [
    { label: "Twitter/X", href: "https://x.com/levimbraga" },
    { label: "Email", href: "mailto:serpvive@gmail.com" },
  ],
};

export default function Footer() {
  return (
    <footer className="py-14 sm:py-16 px-5 sm:px-12 border-t border-[#1E293B]" style={{ background: "#050710" }}>
      <div className="mx-auto" style={{ maxWidth: "min(1600px, 90vw)" }}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-16">
          {/* Logo + tagline */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-[24px] font-extrabold tracking-tight text-white no-underline"
              style={{ letterSpacing: "-0.5px" }}
            >
              Serp<span className="text-[#3B82F6]">Vive</span>
            </Link>
            <p className="text-[14px] text-[#64748B] mt-2">
              Revive your rankings.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-12 sm:gap-16">
            {Object.entries(LINKS).map(([title, links]) => (
              <div key={title} className="flex flex-col gap-3">
                <h4 className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  {title}
                </h4>
                {links.map((link) => {
                  const isExternal = link.href.startsWith("http");
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-[14px] text-[#64748B] hover:text-[#F1F5F9] transition-colors no-underline"
                      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-[#1E293B]">
          <p className="text-[13px] text-[#475569]">
            &copy; 2026 SerpVive. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
