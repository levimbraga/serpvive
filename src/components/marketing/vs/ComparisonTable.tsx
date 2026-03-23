import { Check, X, Minus } from "lucide-react";
import type { FeatureRow } from "@/lib/comparisons";

export default function ComparisonTable({
  features,
  competitorName,
}: {
  features: FeatureRow[];
  competitorName: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#1E293B]">
      <table className="w-full text-left text-[14px]">
        <thead>
          <tr className="border-b border-[#1E293B] bg-[#0C0F18]">
            <th className="px-5 py-4 font-semibold text-[#94A3B8] w-[40%]">
              Feature
            </th>
            <th className="px-5 py-4 font-semibold text-[#94A3B8] w-[30%]">
              {competitorName}
            </th>
            <th className="px-5 py-4 font-semibold text-[#3B82F6] w-[30%]">
              SerpVive
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((row, i) => (
            <tr
              key={row.feature}
              className={`border-b border-[#1E293B]/60 ${
                i % 2 === 0 ? "bg-[#0F1219]" : "bg-[#0C0F18]/50"
              }`}
            >
              <td className="px-5 py-3.5 font-medium text-[#E2E8F0]">
                {row.feature}
              </td>
              <td className="px-5 py-3.5 text-[#CBD5E1]">
                <CellValue
                  value={row.competitor}
                  isWinner={row.winner === "competitor"}
                />
              </td>
              <td className="px-5 py-3.5 text-[#CBD5E1]">
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
      <span className={`flex items-center gap-1.5 ${isWinner ? "text-[#22C55E] font-medium" : "text-[#CBD5E1]"}`}>
        <Check size={15} strokeWidth={2} className="text-[#22C55E]" />
        Yes
      </span>
    );
  }
  if (value === "No") {
    return (
      <span className="flex items-center gap-1.5 text-[#64748B]">
        <X size={15} strokeWidth={2} className="text-[#475569]" />
        No
      </span>
    );
  }
  return (
    <span className={isWinner ? "text-[#22C55E] font-medium" : ""}>
      {value}
    </span>
  );
}
