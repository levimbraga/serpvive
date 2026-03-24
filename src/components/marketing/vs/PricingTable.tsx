import type { PricingTier } from "@/lib/comparisons";

export default function PricingTable({
  pricing,
  competitorName,
}: {
  pricing: PricingTier[];
  competitorName: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
      <table className="w-full text-left text-[14px]">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <th className="px-5 py-4 font-semibold text-[#6B7280] w-[30%]">
              Tier
            </th>
            <th className="px-5 py-4 font-semibold text-[#6B7280] w-[35%]">
              {competitorName}
            </th>
            <th className="px-5 py-4 font-semibold text-[#2563EB] w-[35%]">
              SerpVive
            </th>
          </tr>
        </thead>
        <tbody>
          {pricing.map((tier, i) => (
            <tr
              key={tier.plan}
              className={`border-b border-[#E5E7EB]/60 ${
                i % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]/50"
              }`}
            >
              <td className="px-5 py-3.5 font-medium text-[#111827]">
                {tier.plan}
              </td>
              <td className="px-5 py-3.5 text-[#374151]">
                {tier.competitor}
              </td>
              <td className="px-5 py-3.5 text-[#374151] font-medium">
                {tier.serpvive}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
