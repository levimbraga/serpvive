"use client";

import posthog from "posthog-js";

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
        We don&apos;t just tell you traffic is dropping. We tell you <strong>WHY</strong> with AI-powered diagnosis and exactly <strong>WHAT to fix</strong> — with evidence from your actual SERP competitors.
      </p>

      <a href="/signup" onClick={() => posthog.capture("cta_clicked", { location: "hero" })} className="hero-cta">
        Get Started Free <span className="arrow">→</span>
      </a>

      <div className="hero-trust">
        <span>✓ No credit card required</span>
        <span>✓ 1 free AI diagnosis included</span>
        <span>✓ Setup in under 5 minutes</span>
      </div>
    </section>
  );
}
