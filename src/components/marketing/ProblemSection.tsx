import { Reveal } from "@/hooks/useReveal";

export default function ProblemSection() {
  return (
    <section className="problem">
      <div className="problem-inner">
        <Reveal>
          <h2 className="sh2">
            Your blog is losing traffic right now.<br />
            <span className="dim">You just don&apos;t know it yet.</span>
          </h2>
        </Reveal>
        <Reveal>
          <p className="ssub">The numbers don&apos;t lie — and they&apos;re getting worse with AI Search.</p>
        </Reveal>

        <div className="stats-grid">
          <div className="stat-card reveal">
            <div className="stat-num red">90.63%</div>
            <div className="stat-desc">of published content gets ZERO traffic from Google</div>
            <div className="stat-src">Source: Ahrefs</div>
          </div>
          <div className="stat-card reveal">
            <div className="stat-num orange">-20%</div>
            <div className="stat-desc">organic traffic lost per year when content is neglected</div>
            <div className="stat-src">Source: Conductor</div>
          </div>
          <div className="stat-card reveal">
            <div className="stat-num red">-25%</div>
            <div className="stat-desc">drop in search volume predicted by 2026 due to AI Search</div>
            <div className="stat-src">Source: Gartner</div>
          </div>
        </div>

        <Reveal>
          <div className="alert-box">
            <strong>AI Search is accelerating content decay.</strong> ChatGPT cites content that&apos;s 25.7% fresher than traditional Google results. If you&apos;re not updating, you&apos;re disappearing.
          </div>
        </Reveal>
      </div>
    </section>
  );
}
