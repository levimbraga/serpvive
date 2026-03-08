const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "How It Works", href: "#features" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "mailto:hello@serpvive.com" },
      { label: "Twitter", href: "https://twitter.com/serpvive" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-[#060A14]">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <a href="#" className="text-[22px] font-extrabold tracking-tight">
              <span className="text-white">Serp</span>
              <span className="text-[#0D9488]">Vive</span>
            </a>
            <p className="mt-3 text-[14px] text-[#475569]">Revive your rankings.</p>
          </div>

          {/* Columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-5 text-[11px] font-bold tracking-[0.15em] text-[#475569]">
                {col.title.toUpperCase()}
              </p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[14px] text-[#64748B] transition-colors duration-200 hover:text-[#E2E8F0]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-white/[0.04] pt-8">
          <p className="text-center text-[12px] text-[#334155]">
            &copy; {new Date().getFullYear()} SerpVive. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
