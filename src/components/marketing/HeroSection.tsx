export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pb-[60px] pt-[140px] text-center sm:px-[48px]">
      {/* Decorative arcs */}
      <div className="pointer-events-none absolute left-1/2 top-[-350px] h-[1200px] w-[1200px] -translate-x-1/2 rounded-full border border-[rgba(59,130,246,0.05)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-150px] h-[800px] w-[800px] -translate-x-1/2 rounded-full border border-[rgba(59,130,246,0.04)]" />
      <div className="pointer-events-none absolute left-1/2 top-[50px] h-[500px] w-[500px] -translate-x-1/2 rounded-full border border-[rgba(59,130,246,0.03)]" />

      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-[20%] h-[600px] w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(59,130,246,0.04)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[50%] h-[300px] w-[400px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(249,115,22,0.025)_0%,transparent_70%)]" />

      {/* Tag */}
      <div
        className="mb-[36px] inline-flex items-center gap-[8px] rounded-[100px] border border-[rgba(249,115,22,0.2)] px-[18px] py-[8px] text-[13px] font-[500] text-[#FB923C] animate-[fadeInUp_.6s_ease_both]"
        style={{ background: "rgba(249,115,22,0.12)" }}
      >
        <span className="text-[14px]">✦</span>
        AI-Powered Content Decay Monitor
      </div>

      {/* H1 */}
      <h1 className="mb-[32px] max-w-[1000px] font-[800] leading-[1.02] text-[#F1F5F9] animate-[fadeInUp_.6s_ease_.1s_both] text-[48px] tracking-[-2px] sm:text-[68px] sm:tracking-[-3px] lg:text-[96px] lg:tracking-[-5px]">
        Revive your <span className="text-[#3B82F6]">rankings.</span>
      </h1>

      {/* Subtitle */}
      <p className="mx-auto mb-[44px] max-w-[600px] text-[16px] leading-[1.7] text-[#94A3B8] animate-[fadeInUp_.6s_ease_.2s_both] min-[641px]:text-[20px]">
        Your content is dying. We detect it, explain <strong className="font-[600] text-[#F1F5F9]">WHY</strong> with AI, and tell you exactly <strong className="font-[600] text-[#F1F5F9]">WHAT</strong> to do — so you can fix it in hours, not weeks.
      </p>

      {/* CTA */}
      <a
        href="#waitlist"
        className="group inline-flex items-center gap-[10px] rounded-[12px] bg-[#3B82F6] px-[32px] py-[16px] text-[15px] font-[600] text-white no-underline transition-all duration-[250ms] hover:-translate-y-[2px] hover:bg-[#2563EB] hover:shadow-[0_8px_50px_rgba(59,130,246,0.15)] animate-[fadeInUp_.6s_ease_.3s_both] sm:px-[48px] sm:py-[20px] sm:text-[18px]"
      >
        Get early access
        <span className="text-[20px] transition-transform duration-200 group-hover:translate-x-[3px]">→</span>
      </a>

      {/* Trust badges */}
      <div className="mt-[20px] flex flex-wrap justify-center gap-[12px] animate-[fadeInUp_.6s_ease_.4s_both] sm:gap-[24px]">
        <span className="flex items-center gap-[6px] text-[13px] text-[#64748B]">
          <span className="text-[12px] font-[700] text-[#3B82F6]">✓</span>
          7-day free trial
        </span>
        <span className="flex items-center gap-[6px] text-[13px] text-[#64748B]">
          <span className="text-[12px] font-[700] text-[#3B82F6]">✓</span>
          Cancel anytime
        </span>
        <span className="flex items-center gap-[6px] text-[13px] text-[#64748B]">
          <span className="text-[12px] font-[700] text-[#3B82F6]">✓</span>
          First diagnosis free
        </span>
      </div>
    </section>
  );
}
