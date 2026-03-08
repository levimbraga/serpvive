import { Reveal } from "@/hooks/useReveal";

export default function PricingSection() {
  return (
    <section className="pricing" id="pricing">
      <div className="pricing-inner">
        <Reveal><h2 className="sh2">Simple pricing. Powerful results.</h2></Reveal>
        <Reveal><p className="ssub">All plans include 7-day free trial. Cancel anytime.</p></Reveal>

        <div className="pricing-grid">
          <div className="price-card reveal">
            <div className="pn">Starter</div>
            <div className="pa">$29</div>
            <div className="pp">/month</div>
            <ul className="pf">
              <li>1 site</li>
              <li>100 pages monitored</li>
              <li>10 AI diagnoses/month</li>
              <li>Weekly email digest</li>
            </ul>
            <a href="#waitlist" className="btn">Join Waitlist</a>
          </div>

          <div className="price-card pop reveal">
            <div className="pn">Pro</div>
            <div className="pa">$59</div>
            <div className="pp">/month</div>
            <ul className="pf">
              <li>3 sites</li>
              <li>500 pages monitored</li>
              <li>50 AI diagnoses/month</li>
              <li>Velocity alerts</li>
              <li>CSV export</li>
            </ul>
            <a href="#waitlist" className="btn">Join Waitlist</a>
          </div>

          <div className="price-card reveal">
            <div className="pn">Agency</div>
            <div className="pa">$99</div>
            <div className="pp">/month</div>
            <ul className="pf">
              <li>10 sites</li>
              <li>2,000 pages monitored</li>
              <li>150 AI diagnoses/month</li>
              <li>Client dashboards</li>
              <li>Priority support</li>
            </ul>
            <a href="#waitlist" className="btn">Join Waitlist</a>
          </div>
        </div>

        <p className="pnote">Need more than 10 sites? <a href="mailto:serpvive@gmail.com">serpvive@gmail.com</a></p>
      </div>
    </section>
  );
}
