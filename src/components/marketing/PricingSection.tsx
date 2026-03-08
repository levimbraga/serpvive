import { Reveal } from "@/hooks/useReveal";

type Plan = {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "$29",
    features: ["1 site", "100 pages monitored", "10 AI diagnoses/month", "Weekly email digest"],
  },
  {
    name: "Pro",
    price: "$59",
    features: ["3 sites", "500 pages monitored", "50 AI diagnoses/month", "Velocity alerts", "CSV export"],
    popular: true,
  },
  {
    name: "Agency",
    price: "$99",
    features: ["10 sites", "2,000 pages monitored", "150 AI diagnoses/month", "Client dashboards", "Priority support"],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="px-5 py-[100px] sm:px-[48px]" style={{ background: "#0C0F18" }}>
      <div className="mx-auto max-w-[960px]">
        <Reveal>
          <h2 className="mb-[12px] text-center text-[32px] font-[800] leading-[1.1] tracking-[-1px] text-[#F1F5F9] sm:text-[48px] sm:tracking-[-2px]">
            Simple pricing. Powerful results.
          </h2>
        </Reveal>
        <Reveal>
          <p className="mb-[52px] text-center text-[16px] text-[#64748B]">
            All plans include 7-day free trial. Cancel anytime.
          </p>
        </Reveal>

        {/* 3-col desktop, 1-col mobile */}
        <div className="mx-auto mb-[32px] grid max-w-[400px] grid-cols-1 gap-[20px] lg:max-w-none lg:grid-cols-3">
          {PLANS.map((plan) => (
            <Reveal key={plan.name}>
              <div
                className={`relative rounded-[14px] bg-[#0F1219] p-[40px_28px] text-center transition-all duration-300 hover:-translate-y-[4px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] ${
                  plan.popular ? "border border-[#3B82F6]" : "border border-[#1E293B]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 rounded-[12px] bg-[#3B82F6] px-[16px] py-[5px] text-[10px] font-[700] tracking-[0.5px] text-white">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-[16px] text-[13px] font-[600] uppercase tracking-[1px] text-[#64748B]">{plan.name}</div>
                <div className="mb-[2px] text-[56px] font-[800] tracking-[-2px] text-[#F1F5F9]">{plan.price}</div>
                <div className="mb-[28px] text-[14px] text-[#64748B]">/month</div>
                <ul className="mb-[28px] list-none text-left">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-[10px] py-[8px] text-[14px] text-[#94A3B8]">
                      <span className="text-[13px] font-[700] text-[#3B82F6]">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <a
                  href="#waitlist"
                  className="flex w-full items-center justify-center rounded-[10px] bg-[#3B82F6] py-[14px] text-[14px] font-[600] text-white no-underline transition-all duration-[250ms] hover:-translate-y-[2px] hover:bg-[#2563EB] hover:shadow-[0_8px_40px_rgba(59,130,246,0.15)]"
                >
                  Join Waitlist
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="text-center text-[14px] text-[#64748B]">
          Need more than 10 sites?{" "}
          <a href="mailto:serpvive@gmail.com" className="text-[#3B82F6] no-underline">
            serpvive@gmail.com
          </a>
        </p>
      </div>
    </section>
  );
}
