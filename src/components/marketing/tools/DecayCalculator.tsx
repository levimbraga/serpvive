"use client";

import { useState, useMemo } from "react";
import posthog from "posthog-js";
import WaitlistCTA from "../WaitlistCTA";
import {
  ArrowRight,
  TrendingDown,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Info,
} from "lucide-react";

function formatCurrency(value: number): string {
  if (value >= 1_000_000)
    return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export default function DecayCalculator() {
  const [monthlyClicks, setMonthlyClicks] = useState(10000);
  const [avgCpc, setAvgCpc] = useState(1.5);
  const [decayRate, setDecayRate] = useState(30);

  const results = useMemo(() => {
    const decayingClicks = monthlyClicks * (decayRate / 100);
    const monthlyLoss = decayingClicks * avgCpc;
    const yearlyLoss = monthlyLoss * 12;
    return { decayingClicks, monthlyLoss, yearlyLoss };
  }, [monthlyClicks, avgCpc, decayRate]);

  const handleCalculate = () => {
    posthog.capture("decay_calculator_used", {
      monthly_clicks: monthlyClicks,
      avg_cpc: avgCpc,
      decay_rate: decayRate,
      monthly_loss: results.monthlyLoss,
    });
  };

  return (
    <div className="mx-auto" style={{ maxWidth: "880px" }}>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F1219] p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#F1F5F9] mb-6">
            Your numbers
          </h2>

          <div className="flex flex-col gap-6">
            {/* Monthly Organic Clicks */}
            <div>
              <label className="flex items-center justify-between text-[14px] font-medium text-[#94A3B8] mb-2">
                Monthly organic clicks
                <span className="font-mono text-[#F1F5F9] text-[15px]">
                  {monthlyClicks.toLocaleString()}
                </span>
              </label>
              <input
                type="range"
                min={500}
                max={500000}
                step={500}
                value={monthlyClicks}
                onChange={(e) => setMonthlyClicks(Number(e.target.value))}
                onMouseUp={handleCalculate}
                onTouchEnd={handleCalculate}
                className="w-full accent-[#3B82F6] h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#475569] mt-1">
                <span>500</span>
                <span>500K</span>
              </div>
            </div>

            {/* Average CPC */}
            <div>
              <label className="flex items-center justify-between text-[14px] font-medium text-[#94A3B8] mb-2">
                Average CPC (your niche)
                <span className="font-mono text-[#F1F5F9] text-[15px]">
                  ${avgCpc.toFixed(2)}
                </span>
              </label>
              <input
                type="range"
                min={0.1}
                max={15}
                step={0.1}
                value={avgCpc}
                onChange={(e) => setAvgCpc(Number(e.target.value))}
                onMouseUp={handleCalculate}
                onTouchEnd={handleCalculate}
                className="w-full accent-[#3B82F6] h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#475569] mt-1">
                <span>$0.10</span>
                <span>$15.00</span>
              </div>
            </div>

            {/* Decay Rate */}
            <div>
              <label className="flex items-center justify-between text-[14px] font-medium text-[#94A3B8] mb-2">
                <span className="flex items-center gap-1.5">
                  Estimated decay rate
                  <span className="group relative">
                    <Info
                      size={14}
                      strokeWidth={1.5}
                      className="text-[#475569] cursor-help"
                    />
                    <span className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-[#1E293B] text-[12px] text-[#CBD5E1] p-3 rounded-lg shadow-lg z-10">
                      HubSpot found that ~25-40% of blog content decays
                      annually. 30% is a conservative average.
                    </span>
                  </span>
                </span>
                <span className="font-mono text-[#F1F5F9] text-[15px]">
                  {decayRate}%
                </span>
              </label>
              <input
                type="range"
                min={10}
                max={60}
                step={1}
                value={decayRate}
                onChange={(e) => setDecayRate(Number(e.target.value))}
                onMouseUp={handleCalculate}
                onTouchEnd={handleCalculate}
                className="w-full accent-[#F59E0B] h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#475569] mt-1">
                <span>10%</span>
                <span>60%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#0F1219] p-6 sm:p-8 flex flex-col">
          <h2 className="text-lg font-bold text-[#F1F5F9] mb-6">
            Estimated impact
          </h2>

          <div className="flex flex-col gap-4 flex-1">
            {/* Monthly loss */}
            <div className="rounded-xl bg-[#EF4444]/5 border border-[#EF4444]/15 p-5">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#EF4444] mb-2">
                <DollarSign size={14} strokeWidth={1.5} />
                Monthly revenue at risk
              </div>
              <p
                className="font-extrabold text-[#F1F5F9] tracking-tight"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                {formatCurrency(results.monthlyLoss)}
                <span className="text-[16px] text-[#64748B] font-medium ml-1">
                  /mo
                </span>
              </p>
            </div>

            {/* Yearly loss */}
            <div className="rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/15 p-5">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#F59E0B] mb-2">
                <TrendingDown size={14} strokeWidth={1.5} />
                Annual revenue at risk
              </div>
              <p
                className="font-extrabold text-[#F1F5F9] tracking-tight"
                style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
              >
                {formatCurrency(results.yearlyLoss)}
                <span className="text-[16px] text-[#64748B] font-medium ml-1">
                  /yr
                </span>
              </p>
            </div>

            {/* Decaying clicks */}
            <div className="rounded-xl bg-[#1E293B]/50 border border-[#1E293B] p-5">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#94A3B8] mb-2">
                <BarChart3 size={14} strokeWidth={1.5} />
                Monthly clicks lost to decay
              </div>
              <p className="text-xl font-bold text-[#F1F5F9]">
                {Math.round(results.decayingClicks).toLocaleString()}
                <span className="text-[14px] text-[#64748B] font-medium ml-1">
                  clicks
                </span>
              </p>
            </div>
          </div>

          {/* Context note */}
          <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-[#1E293B]/30 text-[12px] text-[#64748B]">
            <AlertTriangle
              size={14}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0"
            />
            <span>
              This is an estimate based on industry averages. Your actual
              numbers may vary. The only way to know for sure is to monitor
              your content.
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-2xl border border-[#3B82F6]/20 bg-gradient-to-br from-[#3B82F6]/5 to-[#7C3AED]/5 p-8 sm:p-10 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] mb-3">
          Find your actual decaying posts
        </h2>
        <p className="text-[15px] text-[#94A3B8] mb-6 max-w-lg mx-auto">
          Stop guessing. SerpVive connects to your Google Search Console and
          identifies exactly which posts are losing traffic, why, and how to
          fix them.
        </p>
        <WaitlistCTA
          source="decay_calculator"
          className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] text-white font-semibold px-6 py-3 text-[15px] hover:bg-[#2563EB] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] cursor-pointer"
          onClick={() =>
            posthog.capture("cta_clicked", { location: "decay_calculator" })
          }
        >
          Join the waitlist
          <ArrowRight size={16} strokeWidth={1.5} />
        </WaitlistCTA>
      </div>
    </div>
  );
}
