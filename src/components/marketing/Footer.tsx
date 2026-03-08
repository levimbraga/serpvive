const COLUMNS = [
  { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "Changelog", href: "#" }] },
  { title: "Company", links: [{ label: "Blog", href: "#" }, { label: "Contact", href: "mailto:serpvive@gmail.com" }] },
  { title: "Legal", links: [{ label: "Privacy Policy", href: "#" }, { label: "Terms of Service", href: "#" }] },
];

export default function Footer() {
  return (
    <footer
      className="px-5 py-[48px] sm:px-[48px]"
      style={{ background: "#050710", borderTop: "1px solid rgba(30,41,59,0.25)" }}
    >
      <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-8 sm:flex-row">
        {/* Brand */}
        <div>
          <a href="#" className="mb-[8px] block text-[20px] font-[800] text-white no-underline">
            Serp<span className="text-[#3B82F6]">Vive</span>
          </a>
          <p className="text-[12px] text-[#475569]">Revive your rankings.</p>
          <p className="mt-[16px] text-[12px] text-[#475569]">© 2026 SerpVive. All rights reserved.</p>
        </div>

        {/* Links — hidden on mobile */}
        <div className="hidden gap-[64px] sm:flex">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-[14px] text-[11px] font-semibold uppercase tracking-[1px] text-[#475569]">{col.title}</h4>
              {col.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block py-[3px] text-[13px] text-[#64748B] no-underline transition-colors duration-200 hover:text-[#F1F5F9]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
