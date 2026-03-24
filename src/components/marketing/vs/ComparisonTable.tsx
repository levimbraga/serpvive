import { Check, X } from "lucide-react";
import type { FeatureRow } from "@/lib/comparisons";

export default function ComparisonTable({
  features,
  competitorName,
}: {
  features: FeatureRow[];
  competitorName: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
      <table className="w-full text-left text-[14px]">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <th className="px-5 py-4 font-semibold text-[#6B7280] w-[40%]">
              Feature
            </th>
            <th className="px-5 py-4 font-semibold text-[#6B7280] w-[30%]">
              {competitorName}
            </th>
            <th className="px-5 py-4 font-semibold text-[#2563EB] w-[30%]">
              SerpVive
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((row, i) => (
            <tr
              key={row.feature}
              className={`border-b border-[#E5E7EB]/60 ${
                i % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]/50"
              }`}
            >
              <td className="px-5 py-3.5 font-medium text-[#111827]">
                {row.feature}
              </td>
              <td className="px-5 py-3.5 text-[#374151]">
                <CellValue
                  value={row.competitor}
                  isWinner={row.winner === "competitor"}
                />
              </td>
              <td className="px-5 py-3.5 text-[#374151]">
                <CellValue
                  value={row.serpvive}
                  isWinner={row.winner === "serpvive"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CellValue({
  value,
  isWinner,
}: {
  value: string;
  isWinner: boolean;
}) {
  if (value === "Yes") {
    return (
      <span className={`flex items-center gap-1.5 ${isWinner ? "text-[#059669] font-medium" : "text-[#374151]"}`}>
        <Check size={15} strokeWidth={2} className="text-[#059669]" />
        Yes
      </span>
    );
  }
  if (value === "No") {
    return (
      <span className="flex items-center gap-1.5 text-[#9CA3AF]">
        <X size={15} strokeWidth={2} className="text-[#D1D5DB]" />
        No
      </span>
    );
  }
  return (
    <span className={isWinner ? "text-[#059669] font-medium" : ""}>
      {value}
    </span>
  );
}
