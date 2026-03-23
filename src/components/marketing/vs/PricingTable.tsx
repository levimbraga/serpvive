import type { PricingTier } from "@/lib/comparisons";

export default function PricingTable({
  pricing,
  competitorName,
}: {
  pricing: PricingTier[];
  competitorName: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#1E293B]">
      <table className="w-full text-left text-[14px]">
        <thead>
          <tr className="border-b border-[#1E293B] bg-[#0C0F18]">
            <th className="px-5 py-4 font-semibold text-[#94A3B8] w-[30%]">
              Tier
            </th>
            <th className="px-5 py-4 font-semibold text-[#94A3B8] w-[35%]">
              {competitorName}
            </th>
            <th className="px-5 py-4 font-semibold text-[#3B82F6] w-[35%]">
              SerpVive
            </th>
          </tr>
        </thead>
        <tbody>
          {pricing.map((tier, i) => (
            <tr
              key={tier.plan}
              className={`border-b border-[#1E293B]/60 ${
                i % 2 === 0 ? "bg-[#0F1219]" : "bg-[#0C0F18]/50"
              }`}
            >
              <td className="px-5 py-3.5 font-medium text-[#E2E8F0]">
                {tier.plan}
              </td>
              <td className="px-5 py-3.5 text-[#CBD5E1]">
                {tier.competitor}
              </td>
              <td className="px-5 py-3.5 text-[#CBD5E1] font-medium">
                {tier.serpvive}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
