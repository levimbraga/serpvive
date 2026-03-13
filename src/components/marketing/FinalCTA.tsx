"use client";

import posthog from "posthog-js";

export default function FinalCTA() {
  return (
    <section className="final" id="cta">
      <div className="final-inner">
        <h2>
          Your content is decaying right now.<br />
          <span className="dim">Do you know which posts?</span>
        </h2>
        <p className="fsub">
          Stop guessing. Get AI-powered diagnosis with evidence from your actual SERP competitors.
        </p>

        <a
          href="/signup"
          onClick={() => posthog.capture("cta_clicked", { location: "final" })}
          className="hero-cta"
          style={{ display: "inline-block", marginTop: 8, marginBottom: 16 }}
        >
          Get Started Free <span className="arrow">→</span>
        </a>

        <div className="f-trust">
          <span>No credit card required</span>
          <span>Cancel anytime</span>
          <span>First AI diagnosis included</span>
        </div>
      </div>
    </section>
  );
}
