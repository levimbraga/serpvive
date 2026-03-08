import { Reveal } from "@/hooks/useReveal";

export default function ExampleSection() {
  return (
    <section className="example">
      <div className="ex-inner">
        <Reveal><h2 className="sh2">See a real diagnosis in action.</h2></Reveal>
        <Reveal><p className="ssub">This is the level of detail you get. Not &quot;optimize your content.&quot;</p></Reveal>

        <Reveal>
          <div className="dx">
            <div className="dxh">
              <span className="dxbadge">CRITICAL</span>
              <span className="dxu">/best-project-management-tools-2024</span>
              <span className="dxp">-47%</span>
            </div>
            <div className="dxbody">
              <div className="dxs">This post lost 47% of its traffic because the content is outdated, 3 new competitors appeared with fresher information, and the search intent shifted to comparison-style content.</div>

              <div className="cause"><strong>1. Title says &quot;2024&quot;</strong> — all top 3 competitors say &quot;2026&quot;. Google prefers current content.</div>
              <div className="cause"><strong>2. Missing AI section</strong> — top 3 results cover &quot;AI features in PM tools.&quot; Your post doesn&apos;t mention AI once.</div>
              <div className="cause"><strong>3. Wrong pricing</strong> — Monday.com listed at $8/seat. Actual price is $12/seat since March 2025.</div>
              <div className="cause med"><strong>4. No comparison table</strong> — 6 of 10 SERP results use comparison tables. Your post is text-only.</div>

              <div className="brief">
                <div className="brief-t">🔶 REFRESH BRIEF — 6 actions · ~2.5 hours</div>
                <div className="brief-a">🔴 Update title → &quot;Best PM Tools in 2026 (Compared)&quot;</div>
                <div className="brief-a">🔴 Add ~400 word section about AI features in PM tools</div>
                <div className="brief-a">🔴 Fix Monday.com pricing: $8 → $12/seat</div>
                <div className="brief-a">🟡 Add comparison table (12 tools × 6 columns)</div>
                <div className="brief-a">🟡 Fix 2 broken external links</div>
                <div className="brief-a">🟢 Update meta description with 2026 keywords</div>
              </div>

              <div className="result">
                <span className="o">167 clicks/mo</span>
                <span style={{ color: "#94A3B8" }}>→</span>
                <span className="n">298 clicks/mo</span>
                <span className="d">(+78%) ✅</span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal><p className="enote"><strong>Specific issues. Specific fixes. Measurable results.</strong></p></Reveal>
      </div>
    </section>
  );
}
