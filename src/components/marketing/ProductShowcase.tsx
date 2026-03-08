import { Reveal } from "@/hooks/useReveal";

export default function ProductShowcase() {
  return (
    <section className="showcase">
      <div className="showcase-inner">
        <Reveal><div className="showcase-label">What your dashboard looks like</div></Reveal>

        <Reveal>
          <div className="mockup-lg">
            <div className="mockup-bar">
              <div className="dot dot-r" />
              <div className="dot dot-y" />
              <div className="dot dot-g" />
              <span className="mockup-url">serpvive.com/dashboard</span>
            </div>

            <div className="mockup-content">
              {/* Left: Health Score */}
              <div className="m-left">
                <div className="hr">
                  <svg viewBox="0 0 100 100">
                    <circle className="bg" cx="50" cy="50" r="44" />
                    <circle className="prog" cx="50" cy="50" r="44" />
                  </svg>
                  <div className="hn">
                    <span className="n">72</span>
                    <span className="l">/ 100</span>
                  </div>
                </div>
                <div className="m-hl">Health Score</div>
                <div className="m-hd"><span className="neg">-5</span> from last week</div>
                <div className="m-hb">
                  <span className="hbg g">12 Healthy</span>
                  <span className="hbg a">6 Warning</span>
                  <span className="hbg r">4 Critical</span>
                </div>
              </div>

              {/* Right: Page list */}
              <div className="m-right">
                <div className="m-header">
                  <h3>Decaying Pages</h3>
                  <span className="badge">4 need attention</span>
                </div>
                <div className="pr"><div className="sd c" /><span className="pu">/best-crm-software-2024</span><span className="pc">167</span><span className="pd r">-47%</span><span className="db">Diagnose</span></div>
                <div className="pr"><div className="sd c" /><span className="pu">/remote-work-tools-guide</span><span className="pc">284</span><span className="pd r">-32%</span><span className="db">Diagnose</span></div>
                <div className="pr"><div className="sd c" /><span className="pu">/project-management-tips</span><span className="pc">198</span><span className="pd r">-28%</span><span className="db">Diagnose</span></div>
                <div className="pr"><div className="sd w" /><span className="pu">/email-marketing-tips</span><span className="pc">512</span><span className="pd a">-18%</span></div>
                <div className="pr"><div className="sd w" /><span className="pu">/content-strategy-2025</span><span className="pc">345</span><span className="pd a">-12%</span></div>
                <div className="pr"><div className="sd h" /><span className="pu">/saas-pricing-strategies</span><span className="pc">891</span><span className="pd g">-3%</span></div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
