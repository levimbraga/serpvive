"use client";

import { useState } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { Reveal } from "@/hooks/useReveal";

const PLANS = [
  {
    key: "free",
    name: "Free",
    subtitle: "For getting started",
    monthly: 0,
    annual: 0,
    annualTotal: 0,
    period: "forever",
    features: [
      "1 site",
      "100 pages monitored",
      "3 AI diagnoses (lifetime cap)",
      "Weekly monitoring",
      "Health Score + decay detection",
    ],
    cta: "Get Started Free",
    href: "/signup",
    outline: true,
    popular: false,
  },
  {
    key: "starter",
    name: "Starter",
    subtitle: "For solo bloggers",
    monthly: 29,
    annual: 24,
    annualTotal: 288,
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
    outline: false,
    popular: false,
  },
  {
    key: "pro",
    name: "Pro",
    subtitle: "For freelancers & consultants",
    monthly: 69,
    annual: 58,
    annualTotal: 696,
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
    outline: false,
    popular: true,
  },
  {
    key: "agency",
    name: "Agency",
    subtitle: "For teams & agencies",
    monthly: 129,
    annual: 108,
    annualTotal: 1296,
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
    outline: false,
    popular: false,
  },
];

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-12" id="pricing">
      <div className="mx-auto text-center" style={{ maxWidth: "min(1600px, 90vw)" }}>
        <Reveal>
          <h2
            className="font-extrabold leading-[1.1] mb-5"
            style={{ fontSize: "clamp(2rem, 4vw, 4rem)", letterSpacing: "-0.04em" }}
          >
            Simple pricing. Powerful results.
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[16px] sm:text-[18px] text-[#94A3B8] leading-relaxed max-w-[520px] mx-auto mb-4">
            Planned pricing. Payments are not enabled in this public version — every account gets the free tier.
          </p>
        </Reveal>
        <Reveal>
          <p className="text-[14px] text-[#64748B] italic mb-10">
            SEO consultants charge $500–3,000/month for content refresh audits.
          </p>
        </Reveal>

        {/* Monthly / Annual toggle */}
        <Reveal>
          <div className="flex items-center justify-center gap-3 mb-12">
            <span
              className={`text-[14px] transition-colors duration-200 ${
                !isAnnual ? "text-[#E2E8F0] font-semibold" : "text-[#64748B] font-normal"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-[52px] h-[28px] rounded-full border-0 cursor-pointer transition-colors duration-200 flex-shrink-0"
              style={{ background: isAnnual ? "#3B82F6" : "#334155" }}
              aria-label="Toggle annual billing"
            >
              <span
                className="absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white transition-[left] duration-200"
                style={{ left: isAnnual ? 27 : 3 }}
              />
            </button>
            <span
              className={`text-[14px] transition-colors duration-200 ${
                isAnnual ? "text-[#E2E8F0] font-semibold" : "text-[#64748B] font-normal"
              }`}
            >
              Annual
            </span>
            <span className="text-[11px] font-bold text-white bg-[#3B82F6] px-2.5 py-1 rounded-full tracking-wide">
              Save 17%
            </span>
          </div>
        </Reveal>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 items-stretch [&>*]:h-full">
          {PLANS.map((plan) => {
            const price = plan.key === "free" ? 0 : isAnnual ? plan.annual : plan.monthly;
            const showSavings = isAnnual && plan.key !== "free";
            const annualSavings = (plan.monthly * 12) - plan.annualTotal;

            return (
              <Reveal key={plan.key} className="h-full">
                <div
                  className={`rounded-xl p-6 sm:p-7 text-left border transition-all duration-300 hover:-translate-y-0.5 relative flex flex-col h-full ${
                    plan.popular
                      ? "border-[#3B82F6] shadow-[0_0_40px_rgba(59,130,246,0.12)]"
                      : "border-[#1E293B] hover:border-[#334155]"
                  }`}
                  style={{
                    background: "#0F1219",
                    ...(plan.popular ? { borderTopWidth: "4px", borderTopColor: "#3B82F6" } : {}),
                  }}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#3B82F6] px-3.5 py-1.5 rounded-full whitespace-nowrap">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan name + segment */}
                  <div className="text-[13px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
                    {plan.name}
                  </div>
                  <div className="text-[12px] text-[#475569] mb-4">
                    {plan.subtitle}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-1">
                    {plan.key !== "free" && isAnnual && (
                      <span className="text-[22px] text-[#475569] line-through font-medium">
                        ${plan.monthly}
                      </span>
                    )}
                    <span className="text-[40px] sm:text-[44px] font-extrabold text-[#F1F5F9] leading-none" style={{ letterSpacing: "-0.04em" }}>
                      ${price}
                    </span>
                  </div>

                  {/* Period */}
                  <div className="text-[13px] text-[#64748B] mb-2">
                    {plan.key === "free" ? (
                      plan.period
                    ) : isAnnual ? (
                      <>
                        /mo{" "}
                        <span className="text-[11px] text-[#475569]">
                          billed as ${plan.annualTotal}/yr
                        </span>
                      </>
                    ) : (
                      "/month"
                    )}
                  </div>

                  {/* Annual savings */}
                  {showSavings && (
                    <div className="text-[12px] font-semibold text-[#3B82F6] mb-4">
                      Save ${annualSavings}/year
                    </div>
                  )}
                  {!showSavings && <div className="mb-4" />}

                  {/* Features */}
                  <ul className="flex flex-col gap-2.5 mb-7">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#94A3B8]">
                        <span className="text-[#3B82F6] font-bold text-[11px] mt-0.5 flex-shrink-0">&#x2713;</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Spacer to push CTA to bottom */}
                  <div className="flex-1" />

                  {/* CTA — only the free tier is purchasable in this public
                      version; paid tiers show planned pricing with a disabled
                      button instead of a checkout that doesn't exist. */}
                  {plan.key === "free" ? (
                    <Link
                      href="/signup"
                      onClick={() =>
                        posthog.capture("cta_clicked", {
                          location: "pricing",
                          plan: plan.key,
                          interval: isAnnual ? "annual" : "monthly",
                        })
                      }
                      className="block w-full text-center py-3 rounded-lg text-[14px] font-semibold no-underline transition-all duration-200 mt-auto bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)]"
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      title="Payments are not enabled in this public version"
                      className="block w-full text-center py-3 rounded-lg text-[13px] font-semibold mt-auto border border-[#334155] text-[#64748B] cursor-not-allowed"
                    >
                      Planned — not enabled
                    </button>
                  )}
                </div>
              </Reveal>
            );
          })}

          {/* Enterprise */}
          <Reveal className="h-full">
            <div
              className="rounded-xl p-6 sm:p-7 text-left border border-[#1E293B] hover:border-[#334155] transition-all duration-300 hover:-translate-y-0.5 flex flex-col h-full"
              style={{
                background: "linear-gradient(180deg, rgba(15,18,25,1) 0%, rgba(15,18,25,0.7) 100%)",
              }}
            >
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-3">
                For large teams
              </div>
              <div className="text-[13px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
                Enterprise
              </div>
              <div className="text-[40px] sm:text-[44px] font-extrabold text-[#F1F5F9] leading-none mb-1" style={{ letterSpacing: "-0.04em" }}>
                Custom
              </div>
              <div className="text-[13px] text-[#64748B] mb-6">
                tailored to your needs
              </div>
              <ul className="flex flex-col gap-2.5 mb-7">
                {[
                  "Custom number of sites",
                  "Custom page monitoring",
                  "Custom AI diagnoses",
                  "Dedicated account manager",
                  "White-label reports",
                  "SSO / SAML",
                  "Invoice billing",
                  "Priority support & SLA",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#94A3B8]">
                    <span className="text-[#3B82F6] font-bold text-[11px] mt-0.5 flex-shrink-0">&#x2713;</span>
                    {f}
                  </li>
                ))}
              </ul>
              {/* Spacer to push CTA to bottom */}
              <div className="flex-1" />
              <a
                href="mailto:levi@serpvive.com"
                onClick={() =>
                  posthog.capture("cta_clicked", {
                    location: "pricing",
                    plan: "enterprise",
                  })
                }
                className="block w-full text-center py-3 rounded-lg text-[14px] font-semibold no-underline transition-all duration-200 text-[#94A3B8] border border-[#334155] hover:border-[#3B82F6] hover:text-[#3B82F6]"
              >
                Contact Us
              </a>
            </div>
          </Reveal>
        </div>

        {/* Reassurance */}
        <Reveal>
          <p className="mt-8 text-[14px] text-[#94A3B8] max-w-[520px] mx-auto">
            This public version is free. No credit card required — payments are intentionally disabled.
          </p>
        </Reveal>

        {/* Note */}
        <Reveal>
          <p className="mt-3 text-[13px] text-[#64748B] leading-relaxed max-w-[680px] mx-auto">
            All plans include: Health Score, decay detection, velocity tracking,
            seasonal filtering, cannibalization detection, and result tracking.
          </p>
        </Reveal>

        {/* FAQ */}
        <Reveal>
          <div className="mt-16 text-left max-w-[680px] mx-auto">
            <h3
              className="text-[24px] sm:text-[32px] font-extrabold text-center mb-8"
              style={{ letterSpacing: "-0.03em" }}
            >
              Frequently asked questions
            </h3>
            <FaqAccordion />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    q: "What access does SerpVive need?",
    a: "Read-only Google Search Console. We never modify your site or data. You can disconnect anytime from Settings.",
  },
  {
    q: "How is this different from Ahrefs or Semrush?",
    a: "They show you data. We tell you WHY your post is declining and exactly WHAT to update, with ready-to-use drafts. No spreadsheets, no guesswork.",
  },
  {
    q: "How accurate is the AI diagnosis?",
    a: "Powered by advanced AI. Analyzes live SERP results + 3 competitor pages + your content. Every cause includes specific evidence with SERP positions, word counts, and competitor URLs.",
  },
  {
    q: "Can I use this for client blogs?",
    a: "Yes. Pro supports 3 sites, Agency supports 10. Each site gets its own dashboard, Health Score, and diagnosis history.",
  },
  {
    q: "What if my blog has no decaying posts?",
    a: "Great! Your Health Score will reflect that. You\u2019ll still get daily monitoring so you catch decline early \u2014 before it costs you traffic.",
  },
  {
    q: "How does the free plan work?",
    a: "Connect Google Search Console, see your Health Score, and get 3 AI diagnoses (lifetime cap). In this public version every account runs on the free tier \u2014 payments are intentionally disabled.",
  },
  {
    q: "What happens if I cancel?",
    a: "You keep access to your dashboard with weekly data syncs, and your data is preserved. There is no subscription to cancel in this public version.",
  },
  {
    q: "Can I analyze pages that aren\u2019t mine?",
    a: "Yes. Paste any URL + keyword and get a full AI diagnosis. Great for analyzing competitor content or auditing a prospect\u2019s blog before closing a deal.",
  },
];

function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="rounded-xl border border-[#1E293B] overflow-hidden" style={{ background: "#0F1219" }}>
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIdx === i;
        const isLast = i === FAQ_ITEMS.length - 1;
        return (
          <div key={i} className={!isLast ? "border-b border-[#1E293B]" : ""}>
            <button
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 sm:px-7 py-5 text-left hover:bg-[#1E293B]/30 transition-colors"
            >
              <span className="text-[15px] font-medium text-[#F1F5F9]">{item.q}</span>
              <span className="text-[20px] leading-none text-[#64748B] flex-shrink-0 select-none">
                {isOpen ? "\u2212" : "+"}
              </span>
            </button>
            {isOpen && (
              <div className="px-6 sm:px-7 pb-5 -mt-1">
                <p className="text-[14px] text-[#94A3B8] leading-[1.7]">{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
