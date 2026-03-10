import { Reveal } from "@/hooks/useReveal";

export default function PricingSection() {
  return (
    <section className="pricing" id="pricing">
      <div className="pricing-inner">
        <Reveal><h2 className="sh2">Simple pricing. Powerful results.</h2></Reveal>
        <Reveal><p className="ssub">Get started free. No credit card required. Cancel anytime.</p></Reveal>

        <div className="pricing-grid">
          <div className="price-card reveal">
            <div className="pn">Starter</div>
            <div className="pa">$29</div>
            <div className="pp">/month</div>
            <ul className="pf">
              <li>1 site</li>
              <li>100 pages monitored</li>
              <li>10 AI diagnoses/month</li>
              <li>Daily monitoring</li>
              <li>Weekly email digest</li>
            </ul>
            <a href="/signup" className="btn">Choose Starter</a>
          </div>

          <div className="price-card pop reveal">
            <div className="pn">Pro <span className="pop-badge">POPULAR</span></div>
            <div className="pa">$69</div>
            <div className="pp">/month</div>
            <ul className="pf">
              <li>3 sites</li>
              <li>1,000 pages monitored</li>
              <li>40 AI diagnoses/month</li>
              <li>Daily monitoring</li>
              <li>Weekly email digest</li>
            </ul>
            <a href="/signup" className="btn">Choose Pro</a>
          </div>

          <div className="price-card reveal">
            <div className="pn">Agency</div>
            <div className="pa">$129</div>
            <div className="pp">/month</div>
            <ul className="pf">
              <li>10 sites</li>
              <li>5,000 pages monitored</li>
              <li>120 AI diagnoses/month</li>
              <li>Daily monitoring</li>
              <li>Priority support</li>
            </ul>
            <a href="/signup" className="btn">Choose Agency</a>
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

        <p className="pnote">Need more than 10 sites? <a href="mailto:serpvive@gmail.com">serpvive@gmail.com</a></p>
      </div>
    </section>
  );
}
