"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { Reveal } from "@/hooks/useReveal";

const PLANS = [
  {
    key: "free",
    name: "Free",
    monthly: 0,
    annual: 0,
    annualTotal: 0,
    period: "forever",
    features: [
      "1 site",
      "100 pages monitored",
      "1 free AI diagnosis",
      "Weekly monitoring",
      "Health Score + decay detection",
    ],
    cta: "Get Started Free",
    href: "/signup",
    style: "outline" as const,
    popular: false,
  },
  {
    key: "starter",
    name: "Starter",
    monthly: 29,
    annual: 24,
    annualTotal: 290,
    period: "/month",
    features: [
      "1 site",
      "100 pages monitored",
      "10 AI diagnoses/month",
      "Daily monitoring",
      "Weekly email digest",
    ],
    cta: "Choose Starter",
    href: "/signup",
    style: "solid" as const,
    popular: false,
  },
  {
    key: "pro",
    name: "Pro",
    monthly: 69,
    annual: 58,
    annualTotal: 690,
    period: "/month",
    features: [
      "3 sites",
      "1,000 pages monitored",
      "40 AI diagnoses/month",
      "Daily monitoring",
      "Weekly email digest",
    ],
    cta: "Choose Pro",
    href: "/signup",
    style: "solid" as const,
    popular: true,
  },
  {
    key: "agency",
    name: "Agency",
    monthly: 129,
    annual: 108,
    annualTotal: 1290,
    period: "/month",
    features: [
      "10 sites",
      "5,000 pages monitored",
      "120 AI diagnoses/month",
      "Daily monitoring",
      "Priority support",
    ],
    cta: "Choose Agency",
    href: "/signup",
    style: "solid" as const,
    popular: false,
  },
];

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="pricing" id="pricing">
      <div className="pricing-inner">
        <Reveal><h2 className="sh2">Simple pricing. Powerful results.</h2></Reveal>
        <Reveal><p className="ssub">Get started free. No credit card required. Cancel anytime.</p></Reveal>

        {/* Monthly / Annual toggle */}
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "32px 0 36px" }}>
            <span style={{ fontSize: 14, color: !isAnnual ? "#E2E8F0" : "#64748B", fontWeight: !isAnnual ? 600 : 400, transition: "color .2s" }}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              style={{
                position: "relative",
                width: 52,
                height: 28,
                borderRadius: 14,
                background: isAnnual ? "#0D9488" : "#334155",
                border: "none",
                cursor: "pointer",
                transition: "background .2s",
                flexShrink: 0,
              }}
              aria-label="Toggle annual billing"
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: isAnnual ? 27 : 3,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left .2s",
                }}
              />
            </button>
            <span style={{ fontSize: 14, color: isAnnual ? "#E2E8F0" : "#64748B", fontWeight: isAnnual ? 600 : 400, transition: "color .2s" }}>
              Annual
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              background: "#0D9488",
              padding: "3px 10px",
              borderRadius: 10,
              letterSpacing: "0.3px",
            }}>
              Save 17%
            </span>
          </div>
        </Reveal>

        <div className="pricing-grid">
          {PLANS.map((plan) => {
            const price = plan.key === "free" ? 0 : isAnnual ? plan.annual : plan.monthly;
            const showSavings = isAnnual && plan.key !== "free";
            const annualSavings = (plan.monthly * 12) - plan.annualTotal;

            return (
              <div key={plan.key} className={`price-card${plan.popular ? " pop" : ""} reveal`}>
                <div className="pn">{plan.name}</div>
                <div className="pa">
                  {plan.key === "free" ? (
                    "$0"
                  ) : (
                    <>
                      {isAnnual && (
                        <span style={{ fontSize: 24, color: "#475569", textDecoration: "line-through", fontWeight: 500, marginRight: 8 }}>
                          ${plan.monthly}
                        </span>
                      )}
                      ${price}
                    </>
                  )}
                </div>
                <div className="pp">
                  {plan.key === "free" ? plan.period : isAnnual ? (
                    <>
                      /mo <span style={{ fontSize: 12, color: "#64748B" }}>billed as ${plan.annualTotal}/yr</span>
                    </>
                  ) : "/month"}
                </div>
                {showSavings && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0D9488", marginBottom: 16, marginTop: -12 }}>
                    Save ${annualSavings}/year
                  </div>
                )}
                <ul className="pf">
                  {plan.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <a
                  href={plan.href}
                  onClick={() => posthog.capture("cta_clicked", { location: "pricing", plan: plan.key, interval: isAnnual ? "annual" : "monthly" })}
                  className={`btn${plan.style === "outline" ? " btn-outline" : ""}`}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}

          {/* Enterprise — price anchor */}
          <div className="price-card reveal" style={{ borderColor: "#1E293B", background: "linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0.3) 100%)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
              For large teams
            </div>
            <div className="pn">Enterprise</div>
            <div className="pa" style={{ fontSize: 40 }}>Custom</div>
            <div className="pp">tailored to your needs</div>
            <ul className="pf">
              <li>Unlimited sites & pages</li>
              <li>Unlimited AI diagnoses</li>
              <li>Dedicated account manager</li>
              <li>Custom integrations</li>
              <li>Priority support & SLA</li>
              <li>White-label reports</li>
              <li>SSO / SAML</li>
              <li>Invoice billing</li>
            </ul>
            <a
              href="mailto:hello@serpvive.com"
              onClick={() => posthog.capture("cta_clicked", { location: "pricing", plan: "enterprise" })}
              className="btn btn-outline"
            >
              Contact Us
            </a>
          </div>
        </div>

        <p className="pnote" style={{ marginTop: 24, fontSize: 13, color: "#94A3B8" }}>
          All plans include: Health Score, decay detection, velocity tracking, seasonal filtering, cannibalization detection, and result tracking.
        </p>

        <div className="pricing-faq reveal" style={{ marginTop: 32, textAlign: "left", maxWidth: 520, marginInline: "auto" }}>
          <p style={{ fontWeight: 600, fontSize: 15, color: "#E2E8F0", marginBottom: 8 }}>What happens if I cancel?</p>
          <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6 }}>
            You keep access to your dashboard with weekly data syncs. Your data is preserved. Upgrade again anytime to resume daily monitoring and AI diagnoses.
          </p>
        </div>
      </div>
    </section>
  );
}
