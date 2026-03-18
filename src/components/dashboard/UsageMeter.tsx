import Link from "next/link";
import { Zap } from "lucide-react";

type UsageMeterProps = {
  used: number;
  limit: number;
  plan: string;
  hasGsc?: boolean;
  hasFreeDiagnosis?: boolean;
};

export default function UsageMeter({ used, limit, plan, hasGsc, hasFreeDiagnosis }: UsageMeterProps) {
  if (plan === "free") {
    // Free + GSC + diagnosis not used yet
    if (hasGsc && !hasFreeDiagnosis) {
      return (
        <div data-tour="usage-meter" className="bg-white rounded-lg border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={18} strokeWidth={1.5} className="text-[#0D9488]" />
              <span className="text-sm font-medium text-[#111827]">AI Diagnoses</span>
            </div>
            <span className="text-xs text-[#9CA3AF] capitalize">{plan} plan</span>
          </div>

          <p className="text-sm text-[#374151] mb-3">
            You have <strong className="text-[#0D9488]">1 free AI diagnosis</strong>. Pick any page to analyze.
          </p>

          <Link
            href="/pages"
            className="block w-full text-center text-sm font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-lg py-2 transition-colors"
          >
            Use your free diagnosis
          </Link>
        </div>
      );
    }

    // Free + GSC + diagnosis already used
    if (hasGsc) {
      return (
        <div data-tour="usage-meter" className="bg-white rounded-lg border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={18} strokeWidth={1.5} className="text-[#7C3AED]" />
              <span className="text-sm font-medium text-[#111827]">AI Diagnoses</span>
            </div>
            <span className="text-xs text-[#9CA3AF] capitalize">{plan} plan</span>
          </div>

          <p className="text-sm text-[#6B7280] mb-3">
            Upgrade to run unlimited AI diagnoses on any page.
          </p>

          <Link
            href="/settings"
            className="block w-full text-center text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg py-2 transition-colors"
          >
            Upgrade plan
          </Link>
        </div>
      );
    }

    // Free without GSC
    return (
      <div data-tour="usage-meter" className="bg-white rounded-lg border border-[#E5E7EB] p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={18} strokeWidth={1.5} className="text-[#7C3AED]" />
            <span className="text-sm font-medium text-[#111827]">AI Diagnoses</span>
          </div>
          <span className="text-xs text-[#9CA3AF] capitalize">{plan} plan</span>
        </div>

        <p className="text-sm text-[#6B7280] mb-3">
          Connect Google Search Console to get your free AI diagnosis.
        </p>

        <Link
          href="/onboarding"
          className="block w-full text-center text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg py-2 transition-colors"
        >
          Connect GSC
        </Link>
      </div>
    );
  }

  // Paid plans: normal counter
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
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
