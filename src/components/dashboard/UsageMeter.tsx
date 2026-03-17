import Link from "next/link";
import { Zap, Lock } from "lucide-react";

type UsageMeterProps = {
  used: number;
  limit: number;
  plan: string;
  hasGsc?: boolean;
};

export default function UsageMeter({ used, limit, plan, hasGsc }: UsageMeterProps) {
  const isFree = plan === "free";

  if (isFree) {
    // Free plan with GSC: show "0/1 remaining" (1 free diagnosis)
    if (hasGsc) {
      const freeLimit = 1;
      const freeRemaining = Math.max(freeLimit - used, 0);
      return (
        <div data-tour="usage-meter" className="bg-white rounded-lg border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={18} strokeWidth={1.5} className="text-[#7C3AED]" />
              <span className="text-sm font-medium text-[#111827]">AI Diagnoses</span>
            </div>
            <span className="text-xs text-[#9CA3AF] capitalize">{plan} plan</span>
          </div>

          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-bold text-[#111827]">{used}</span>
            <span className="text-sm text-[#6B7280]">/ {freeLimit} free diagnosis</span>
          </div>

          <div className="w-full bg-[#E5E7EB] rounded-full h-2 overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((used / freeLimit) * 100, 100)}%`, backgroundColor: used >= freeLimit ? "#DC2626" : "#7C3AED" }}
            />
          </div>

          {freeRemaining === 0 && (
            <Link
              href="/settings"
              className="block w-full text-center text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg py-2 transition-colors"
            >
              Upgrade for more diagnoses
            </Link>
          )}
        </div>
      );
    }

    // Free plan without GSC
    return (
      <div data-tour="usage-meter" className="bg-white rounded-lg border border-[#E5E7EB] p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={18} strokeWidth={1.5} className="text-[#7C3AED]" />
            <span className="text-sm font-medium text-[#111827]">AI Diagnoses</span>
          </div>
          <span className="text-xs text-[#9CA3AF] capitalize">{plan} plan</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Lock size={16} strokeWidth={1.5} className="text-[#9CA3AF]" />
          <span className="text-sm text-[#6B7280]">Upgrade to run AI analyses</span>
        </div>

        <Link
          href="/settings"
          className="block w-full text-center text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg py-2 transition-colors"
        >
          Upgrade plan
        </Link>
      </div>
    );
  }

  const pct = Math.min((used / limit) * 100, 100);
  const barColor = pct >= 90 ? "#DC2626" : pct >= 70 ? "#D97706" : "#3B82F6";

  return (
    <div data-tour="usage-meter" className="bg-white rounded-lg border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={18} strokeWidth={1.5} className="text-[#7C3AED]" />
          <span className="text-sm font-medium text-[#111827]">AI Diagnoses</span>
        </div>
        <span className="text-xs text-[#9CA3AF] capitalize">{plan} plan</span>
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-[#111827]">{used}</span>
        <span className="text-sm text-[#6B7280]">/ {limit} this month</span>
      </div>

      <div className="w-full bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
