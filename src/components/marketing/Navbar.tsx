export default function Navbar() {
  return (
    <nav
      className="fixed left-0 right-0 top-0 z-[100] flex h-[68px] items-center justify-between px-4 sm:px-[48px]"
      style={{
        background: "rgba(7,9,15,0.8)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(30,41,59,0.35)",
      }}
    >
      <a href="#" className="text-[26px] font-[800] tracking-[-0.5px] text-white no-underline">
        Serp<span className="text-[#3B82F6]">Vive</span>
      </a>
      <div className="flex items-center gap-[36px]">
        <a href="#features" className="hidden text-[14px] font-[500] text-[#94A3B8] no-underline transition-colors duration-200 hover:text-white sm:block">
          Features
        </a>
        <a href="#pricing" className="hidden text-[14px] font-[500] text-[#94A3B8] no-underline transition-colors duration-200 hover:text-white sm:block">
          Pricing
        </a>
        <a href="#faq" className="hidden text-[14px] font-[500] text-[#94A3B8] no-underline transition-colors duration-200 hover:text-white sm:block">
          FAQ
        </a>
        <a
          href="#waitlist"
          className="rounded-[8px] bg-[#3B82F6] px-[24px] py-[10px] text-[14px] font-[600] text-white no-underline transition-all duration-200 hover:bg-[#2563EB] hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
        >
          Join Waitlist
        </a>
      </div>
    </nav>
  );
}
