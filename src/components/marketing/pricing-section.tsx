"use client";

import { Check, X } from "lucide-react";
import { useFadeIn } from "@/hooks/use-fade-in";

type Feature = { text: string; included: boolean };

type Plan = {
  name: string;
  price: string;
  period: string;
  desc: string;
  popular: boolean;
  features: Feature[];
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    desc: "For bloggers and solo founders with one site.",
    popular: false,
    features: [
      { text: "1 site", included: true },
      { text: "100 pages monitored", included: true },
      { text: "10 AI diagnoses/month", included: true },
      { text: "1 team member", included: true },
      { text: "Weekly email digest", included: true },
      { text: "Velocity alerts", included: false },
      { text: "CSV export", included: false },
      { text: "Client dashboards", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$59",
    period: "/mo",
    desc: "For content teams managing multiple blogs.",
    popular: true,
    features: [
      { text: "3 sites", included: true },
      { text: "500 pages monitored", included: true },
      { text: "30 AI diagnoses/month", included: true },
      { text: "3 team members", included: true },
      { text: "Weekly email digest", included: true },
      { text: "Velocity alerts", included: true },
      { text: "CSV export", included: true },
      { text: "Client dashboards", included: false },
    ],
  },
  {
    name: "Agency",
    price: "$99",
    period: "/mo",
    desc: "For SEO consultants and agencies with client sites.",
    popular: false,
    features: [
      { text: "10 sites", included: true },
      { text: "2,000 pages monitored", included: true },
      { text: "100 AI diagnoses/month", included: true },
      { text: "10 team members", included: true },
      { text: "Weekly digest per site", included: true },
      { text: "Velocity alerts", included: true },
      { text: "CSV export", included: true },
      { text: "Client dashboards", included: true },
    ],
  },
];

export default function PricingSection() {
  const { ref, isVisible } = useFadeIn();

  return (
    <section className="relative bg-[#0A0E1A] py-28" id="pricing">
      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      <div
        ref={ref}
        className={`relative mx-auto max-w-[1200px] px-6 transition-all duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <p className="text-center text-[11px] font-bold tracking-[0.25em] text-[#0D9488]">
          PRICING
        </p>
        <h2 className="mt-4 text-center text-[32px] font-extrabold tracking-[-0.02em] text-white sm:text-[40px]">
          Simple, transparent pricing.
        </h2>
        <p className="mx-auto mt-4 max-w-[440px] text-center text-[16px] leading-[1.7] text-[#94A3B8]">
          No hidden fees. No &ldquo;contact us.&rdquo; Start with a 7-day free trial.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] ${
                plan.popular
                  ? "border-[#0D9488]/40 bg-[#0D9488]/[0.04] shadow-[0_0_50px_rgba(13,148,136,0.06)]"
                  : "border-[#1E293B] bg-[#111827]"
              }`}
              style={{
                transitionDelay: isVisible ? `${i * 100}ms` : "0ms",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#0D9488] px-5 py-1.5 text-[11px] font-bold tracking-wide text-white shadow-[0_0_20px_rgba(13,148,136,0.3)]">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-[18px] font-bold text-white">{plan.name}</h3>
                <p className="mt-1.5 text-[13px] text-[#94A3B8]">{plan.desc}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-[48px] font-extrabold leading-none text-white">
                  {plan.price}
                </span>
                <span className="text-[15px] font-medium text-[#64748B]">{plan.period}</span>
              </div>

              <div className="mb-8 flex-1 space-y-3.5">
                {plan.features.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-3">
                    {feature.included ? (
                      <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#0D9488]/10">
                        <Check size={11} strokeWidth={2.5} className="text-[#0D9488]" />
                      </div>
                    ) : (
                      <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1E293B]/50">
                        <X size={11} strokeWidth={2.5} className="text-[#475569]" />
                      </div>
                    )}
                    <span
                      className={`text-[13px] ${
                        feature.included ? "text-[#E2E8F0]" : "text-[#475569]"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href="#waitlist"
                className={`block rounded-lg py-3.5 text-center text-[14px] font-semibold transition-all duration-200 hover:-translate-y-[1px] ${
                  plan.popular
                    ? "bg-[#0D9488] text-white hover:bg-[#0F766E] hover:shadow-[0_0_30px_rgba(13,148,136,0.3)]"
                    : "border border-[#1E293B] text-white hover:border-[#0D9488]/30 hover:bg-[#0D9488]/5"
                }`}
              >
                Join Waitlist
              </a>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-[13px] text-[#475569]">
          Launching soon. All plans include a 7-day free trial. Need more than 10 sites?{" "}
          <a
            href="mailto:hello@serpvive.com"
            className="text-[#0D9488] transition-colors hover:text-[#0F766E]"
          >
            hello@serpvive.com
          </a>
        </p>
      </div>
    </section>
  );
}
