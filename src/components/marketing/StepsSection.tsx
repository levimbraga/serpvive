import { Reveal } from "@/hooks/useReveal";

export default function StepsSection() {
  return (
    <section className="steps" id="features">
      <div className="steps-inner">
        <Reveal><h2 className="sh2">The complete content rescue system.</h2></Reveal>
        <Reveal><p className="ssub">No other tool does all 5 steps.</p></Reveal>

        <div className="steps-grid">
          <div className="step reveal"><div className="sn">1</div><h3>DETECT</h3><p>Monitor every page daily. Know the moment traffic drops.</p><span className="st free">FREE · AUTOMATIC</span></div>
          <div className="step ai reveal"><div className="sn">2</div><h3>DIAGNOSE</h3><p>AI analyzes SERP, competitors &amp; your content. Explains WHY.</p><span className="st ai">CLAUDE OPUS 4.6</span></div>
          <div className="step ai reveal"><div className="sn">3</div><h3>RECOMMEND</h3><p>&ldquo;Change title to X, add section about Y, fix price Z.&rdquo;</p><span className="st ai">MICRO-DRAFTS</span></div>
          <div className="step reveal"><div className="sn">4</div><h3>TRACK</h3><p>Mark your post as updated. We snapshot the metrics.</p><span className="st auto">ONE CLICK</span></div>
          <div className="step reveal"><div className="sn">5</div><h3>PROVE</h3><p>28 days later: automatic before vs after. Did it work?</p><span className="st auto">AUTOMATIC</span></div>
        </div>

        <div className="ctr"><a href="#waitlist" className="btn">Join the Waitlist →</a></div>
      </div>
    </section>
  );
}
