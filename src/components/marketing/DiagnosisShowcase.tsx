export function DiagnosisShowcase() {
  return (
    <div className="mx-auto max-w-[740px] relative">
      {/* LIVE ANALYSIS badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          LIVE ANALYSIS
        </span>
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">

        {/* Header: URL + keyword + metrics */}
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mb-1">/blog/jade-plant-care-guide</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Analyzed for: <span className="font-medium text-slate-600 dark:text-slate-300">jade succulent</span>{" "}
            <span className="text-slate-400">(custom)</span>
          </p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Clicks (28d)</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">1</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Impressions</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">174</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">Avg Position</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">#54</p>
            </div>
          </div>
        </div>

        {/* Content Analysis section */}
        <div className="px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            Content Analysis
          </h3>

          {/* Summary */}
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 mb-5">
            SERP #1 is an e-commerce page, #4 is Wikipedia, #5/#7 are YouTube, #10 is Amazon — only 2 of 10 results are care guides. Your 5,428-word guide outclasses every informational competitor, but &apos;jade succulent&apos; has mixed/transactional intent that Google rewards with product pages. Retargeting to &apos;jade plant care&apos; and doubling internal links from 16 to 40+ could capture ~80-150 clicks/month.
          </p>

          {/* Topic Coverage */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Topic Coverage</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">14 / 16 (88%)</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "88%" }} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span className="font-medium text-amber-600 dark:text-amber-400">Missing:</span>{" "}
              Where to buy jade plants / purchasing options (SERP #1 mountaincrestgardens.com and #10 Amazon dominate with this). Jade plant pricing / cost ranges by variety and size.
            </p>
          </div>

          {/* Strengths */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3">What you&apos;re doing right</h4>
            <div className="space-y-2.5">
              <div className="flex gap-2">
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                <p className="text-sm text-slate-600 dark:text-slate-300">At 5,428 words with 60 headings, your guide is 2-3x more comprehensive than every informational competitor in this SERP — SERP #3 (joyusgarden.com) has 2,323 words and SERP #2 (thenextgardener.com) has 2,360 words</p>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                <p className="text-sm text-slate-600 dark:text-slate-300">Your 8-variety comparison table with leaf shape, max size, unique features, and care differences is unique in this SERP — no competitor offers a structured variety comparison, which is a strong Featured Snippet and AI Overview citation candidate</p>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                <p className="text-sm text-slate-600 dark:text-slate-300">The &apos;Quick Answer&apos; box at the top with a concise care summary directly matches Featured Snippet format and is the most extractable answer in the SERP for care-related queries</p>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                <p className="text-sm text-slate-600 dark:text-slate-300">Structured troubleshooting section with emoji-coded problems (yellow leaves, root rot, mealybugs, leggy growth) covers every common issue mentioned across SERP #3, #6, and #8 — all in one place with clear diagnosis steps</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-slate-700 my-5" />

          {/* Causes */}
          <div className="space-y-4 mb-6">
            {/* Cause 1 - High */}
            <div className="border-l-4 border-red-500 pl-4 py-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white pr-3">Intent mismatch: &apos;jade succulent&apos; triggers product/entity results, not care guides</h4>
                <span className="shrink-0 text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 rounded">High</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">The SERP for &apos;jade succulent&apos; is dominated by commercial and entity-level results: position #1 is a product category page (mountaincrestgardens.com), #4 is Wikipedia, #5 and #7 are YouTube videos, #10 is Amazon. Only 2 of the top 10 are care guides (#3 joyusgarden.com, #6 plantsavvy.com). Google interprets &apos;jade succulent&apos; as a mixed-intent entity query, not primarily a care query. Your primary keyword should be &apos;jade plant care&apos; or &apos;jade plant care guide&apos; where care guides dominate positions #1-5.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Evidence: SERP breakdown: 3 product/e-commerce pages (#1, #9, #10 Amazon), 2 YouTube videos (#5, #7), 1 Wikipedia (#4), 1 classification article (#2), 2 care guides (#3, #6), 1 university extension (#8). Only 20% of SERP slots go to care-format content matching your page type.</p>
            </div>

            {/* Cause 2 - High */}
            <div className="border-l-4 border-red-500 pl-4 py-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white pr-3">Low internal linking (16 links) vs competitors with 27-50 — signals weak topical authority to Google</h4>
                <span className="shrink-0 text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 rounded">High</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Your page has 16 internal links. SERP #1 (mountaincrestgardens.com) has 43, SERP #2 (thenextgardener.com) has 50, and SERP #3 (joyusgarden.com) has 27. For a comprehensive pillar guide covering 8 varieties, propagation, soil, light, watering, and troubleshooting, you should have 35-50 internal links connecting to related content. You&apos;re missing links from each variety section to dedicated variety pages, from the soil section to pot drainage content, and from the troubleshooting section to individual problem-solving articles.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Evidence: Your internal links: 16. SERP #1: 43. SERP #2: 50. SERP #3: 27. Your average: 60% below the SERP top-3 average of 40 internal links.</p>
            </div>

            {/* Cause 3 - Medium */}
            <div className="border-l-4 border-amber-500 pl-4 py-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white pr-3">Title tag doesn&apos;t match dominant SERP framing — too care-focused for an entity keyword</h4>
                <span className="shrink-0 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">Medium</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Your title is 82 characters — will be truncated in SERPs. SERP #3 (joyusgarden.com) ranks with &apos;Jade Plant Care: Easy Tips for Growing Indoors &amp; Out&apos; — shorter at ~52 characters. Your &apos;8 varieties&apos; differentiator is invisible because it&apos;s buried. Shorten to ~55-60 characters: &apos;Jade Succulent: Complete Care Guide (8 Varieties + Fixes)&apos;.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Evidence: SERP #1 title: ~28 chars. SERP #3: ~52 chars. Your title: ~82 chars, truncated to ~60. The &apos;8 varieties&apos; angle is your unique differentiator but currently invisible.</p>
            </div>

            {/* Cause 4 - Medium */}
            <div className="border-l-4 border-amber-500 pl-4 py-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white pr-3">No video content on page — 2 of top 10 SERP positions are YouTube videos</h4>
                <span className="shrink-0 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">Medium</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">SERP #5 and #7 are YouTube videos holding 20% of page-1 slots. Google is signaling that this keyword benefits from video content. Your page has zero embedded videos. Embedding a 2-3 minute care overview video would add dwell time, enable video rich snippet eligibility, and match the multimedia format Google rewards.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Evidence: 2 of 10 SERP results are YouTube videos (#5 and #7). Your page: 0 videos, 7 images.</p>
            </div>

            {/* Cause 5 - Low */}
            <div className="border-l-4 border-emerald-500 pl-4 py-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white pr-3">External links point exclusively to Amazon affiliate pages — no authoritative botanical sources</h4>
                <span className="shrink-0 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded">Low</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">All 7 of your external links go to Amazon (amzn.to affiliate links). Zero external links point to authoritative botanical or horticultural sources. SERP #8 (extension.sdstate.edu) IS an extension service. SERP #9 (libguides.nybg.org) is the New York Botanical Garden — the authoritative sources you should be citing.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Evidence: 7 external links, all amzn.to. SERP #8 and #9 ARE the authoritative sources you&apos;re missing. Adding 3-5 authoritative outbound links is a low-effort trust signal improvement.</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-slate-700 my-5" />

          {/* Refresh Brief */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span>✨</span> Refresh Brief
              </h3>
              <span className="text-xs text-slate-400 dark:text-slate-500">Est. 4h total effort</span>
            </div>

            <div className="space-y-3">
              {/* Action 1 — EXPANDED with micro-draft */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800">
                  <span className="shrink-0 text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 rounded">Urgent</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Revise Title Tag for Better SERP Alignment</span>
                  <span className="ml-auto text-xs text-slate-400 shrink-0">20min · title</span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">The current title tag is too long and care-focused, which may not align with the mixed intent of the &apos;jade succulent&apos; query. Shortening and refocusing the title can improve CTR and stop the loss of ~2 clicks/day, potentially recovering ~60 clicks/month.</p>

                  {/* Micro-draft box — matches real product UI */}
                  <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-[#16A34A] uppercase tracking-wider">Micro-draft: title suggestions</p>
                      <span className="p-1.5 rounded-md text-[#16A34A]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      </span>
                    </div>
                    <ul className="space-y-3 font-mono">
                      <li className="text-sm text-[#111827] flex gap-2">
                        <span className="text-[#16A34A] flex-shrink-0 mt-0.5">→</span>
                        <span>Jade Succulent: Complete Care Guide (8 Varieties)</span>
                      </li>
                      <li className="text-sm text-[#111827] flex gap-2">
                        <span className="text-[#16A34A] flex-shrink-0 mt-0.5">→</span>
                        <span>Jade Succulent Care: 8 Varieties &amp; Fixes</span>
                      </li>
                      <li className="text-sm text-[#111827] flex gap-2">
                        <span className="text-[#16A34A] flex-shrink-0 mt-0.5">→</span>
                        <span>Jade Plant Care Guide 2026: Varieties &amp; Solutions</span>
                      </li>
                    </ul>
                    <div className="mt-3 pt-2 border-t border-[#BBF7D0]">
                      <p className="text-xs text-[#6B7280]">References: joyusgarden.com uses a concise title that front-loads the primary keyword, improving CTR.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action 2 — collapsed */}
              <div className="flex items-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="shrink-0 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">Important</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">Increase Internal Linking to Boost Topical Authority</span>
                <span className="ml-auto text-xs text-slate-400 shrink-0">120min · structure</span>
              </div>

              {/* Action 3 — collapsed */}
              <div className="flex items-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="shrink-0 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">Important</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">Embed Video Content to Match SERP Trends</span>
                <span className="ml-auto text-xs text-slate-400 shrink-0">90min · content</span>
              </div>

              {/* Action 4 — collapsed */}
              <div className="flex items-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="shrink-0 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded">Nice to have</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">Add Authoritative External Links</span>
                <span className="ml-auto text-xs text-slate-400 shrink-0">30min · content</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fade overlay + CTA */}
        <div className="relative">
          <div className="absolute inset-x-0 -top-20 h-20 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
          <div className="bg-white dark:bg-slate-900 px-6 py-8 text-center border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">This is a real analysis of a live blog post — not a mockup.</p>
            <div className="flex gap-3 justify-center">
              <a href="/signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
                Get Started Free →
              </a>
              <a href="/pricing" className="inline-flex items-center gap-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                See Pricing
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
