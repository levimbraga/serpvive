"use client";

import Link from "next/link";
import posthog from "posthog-js";

export default function DemoBottomCTA({ demoId }: { demoId: string }) {
  return (
    <section className="border-t border-[#E5E7EB]" style={{ background: "linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)" }}>
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="border border-[#BFDBFE] rounded-xl p-8 bg-white/50">
          <h2 className="text-2xl font-semibold text-[#111827] mb-3">
            Want this for your entire blog?
          </h2>
          <p className="text-[#4B5563] mb-8 max-w-md mx-auto">
            SerpVive tracks your blog automatically, scores every page for traffic loss, and shows you WHY a page is losing and WHAT to fix — with AI.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-8 text-left">
            {[
              "Automatic monitoring, weekly on the free tier",
              "AI diagnosis with competitor analysis",
              "Micro-drafts so you write without researching",
              "Before/after proof that fixes worked",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#16A34A] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-[#374151]">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Link
              href="/signup"
              onClick={() => posthog.capture("demo_bottom_cta_clicked", { demo_id: demoId, cta: "signup" })}
              className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-colors"
            >
              Get Started Free &rarr;
            </Link>
            <Link
              href="/#pricing"
              onClick={() => posthog.capture("demo_bottom_cta_clicked", { demo_id: demoId, cta: "pricing" })}
              className="inline-flex items-center justify-center h-11 px-8 rounded-lg border border-[#E5E7EB] hover:border-[#3B82F6] text-[#374151] text-sm font-medium transition-colors"
            >
              See Pricing
            </Link>
          </div>
          <p className="text-xs text-[#9CA3AF]">No credit card required &middot; Free plan available</p>
        </div>
      </div>
    </section>
  );
}
