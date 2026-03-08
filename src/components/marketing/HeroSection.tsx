export default function HeroSection() {
  return (
    <section className="hero">
      <div className="arc arc1" />
      <div className="arc arc2" />
      <div className="arc arc3" />
      <div className="hero-glow" />
      <div className="hero-glow2" />

      <div className="hero-tag">AI-Powered Content Decay Monitor</div>

      <h1>Revive your <span className="accent">rankings.</span></h1>

      <p className="hero-sub">
        Your content is dying. We detect it, explain <strong>WHY</strong> with AI, and tell you exactly <strong>WHAT</strong> to do — so you can fix it in hours, not weeks.
      </p>

      <a href="#waitlist" className="hero-cta">
        Get early access <span className="arrow">→</span>
      </a>

      <div className="hero-trust">
        <span>7-day free trial</span>
        <span>Cancel anytime</span>
        <span>First diagnosis free</span>
      </div>
    </section>
  );
}
