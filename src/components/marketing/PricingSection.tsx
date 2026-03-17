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
    outline: true,
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
    outline: false,
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
    outline: false,
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
    outline: false,
    popular: false,
  },
];

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-12" id="pricing">
      <div className="max-w-[1120px] mx-auto text-center">
        <Reveal>
          <h2
            className="text-[32px] sm:text-[44px] lg:text-[52px] font-extrabold leading-[1.1] mb-5"
            style={{ letterSpacing: "-0.04em" }}
          >
            Simple pricing. Powerful results.
          </h2>
        </Reveal>
        <Reveal>
          <p className="text-[16px] sm:text-[18px] text-[#94A3B8] leading-relaxed max-w-[460px] mx-auto mb-10">
            Get started free. No credit card required. Cancel anytime.
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
                      ? "border-[#3B82F6] shadow-[0_0_40px_rgba(59,130,246,0.1)]"
                      : "border-[#1E293B] hover:border-[#334155]"
                  }`}
                  style={{ background: "#0F1219" }}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#3B82F6] px-3.5 py-1.5 rounded-full whitespace-nowrap">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan name */}
                  <div className="text-[13px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
                    {plan.name}
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

                  {/* CTA */}
                  <a
                    href={plan.href}
                    onClick={() =>
                      posthog.capture("cta_clicked", {
                        location: "pricing",
                        plan: plan.key,
                        interval: isAnnual ? "annual" : "monthly",
                      })
                    }
                    className={`block w-full text-center py-3 rounded-lg text-[14px] font-semibold no-underline transition-all duration-200 mt-auto ${
                      plan.outline
                        ? "text-[#94A3B8] border border-[#334155] hover:border-[#3B82F6] hover:text-[#3B82F6]"
                        : plan.popular
                        ? "bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)]"
                        : "bg-[#1E293B] text-[#F1F5F9] hover:bg-[#334155]"
                    }`}
                  >
                    {plan.cta}
                  </a>
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
                href="mailto:serpvive@gmail.com"
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

        {/* Note */}
        <Reveal>
          <p className="mt-8 text-[13px] text-[#64748B] leading-relaxed max-w-[680px] mx-auto">
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
    q: "What happens if I cancel?",
    a: "You keep access to your dashboard with weekly data syncs. Your data is preserved. Upgrade again anytime to resume daily monitoring and AI diagnoses.",
  },
  {
    q: "My site is new. Can I still use SerpVive?",
    a: "Yes! Decay monitoring needs a few months of traffic history, but you can run AI analysis on any page from day one. The diagnosis compares your content against current SERP competitors regardless of your traffic history.",
  },
  {
    q: "How is this different from Surfer SEO or Ahrefs?",
    a: "Surfer helps you create content. Ahrefs tracks rankings. SerpVive protects what you already have \u2014 we diagnose WHY posts are declining and tell you exactly WHAT to fix, with evidence from your real competitors.",
  },
  {
    q: "What does the AI diagnosis include?",
    a: "Specific causes of decline with evidence from your real SERP competitors, topic coverage score, ready-to-copy title suggestions, corrected data (outdated prices, stats), missing topics with competitor references, and time estimates for each fix.",
  },
  {
    q: "Can I analyze pages that aren\u2019t mine?",
    a: "Yes. Paste any URL + keyword and get a full AI diagnosis. Great for analyzing competitor content or auditing a prospect\u2019s blog before closing a deal.",
  },
  {
    q: "How long until I see results?",
    a: "You can run a new diagnosis immediately after making changes to see your updated competitive position. Automatic before/after measurement happens after 28 days.",
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
