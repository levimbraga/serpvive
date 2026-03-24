import Link from "next/link";
import { Zap, Loader2 } from "lucide-react";

type UsageMeterProps = {
  used: number;
  limit: number;
  plan: string;
  hasGsc?: boolean;
  hasFreeDiagnosis?: boolean;
  autoDiagStatus?: string;
};

export default function UsageMeter({ used, limit, plan, hasGsc, hasFreeDiagnosis, autoDiagStatus }: UsageMeterProps) {
  if (plan === "free") {
    // Engine hasn't run yet — don't show AI diagnosis card
    if (!autoDiagStatus || autoDiagStatus === "pending") {
      return null;
    }

    // Engine running
    if (autoDiagStatus === "engine_running") {
      return (
        <div data-tour="usage-meter" className="bg-white rounded-lg border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={18} strokeWidth={1.5} className="text-[#7C3AED]" />
              <span className="text-sm font-medium text-[#111827]">AI Diagnoses</span>
            </div>
            <span className="text-xs text-[#9CA3AF] capitalize">{plan} plan</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Loader2 size={14} strokeWidth={1.5} className="animate-spin text-[#3B82F6]" />
            Running decay engine...
          </div>
        </div>
      );
    }

    // Auto-diagnosis in progress
    if (autoDiagStatus === "diagnosing") {
      return (
        <div data-tour="usage-meter" className="bg-white rounded-lg border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={18} strokeWidth={1.5} className="text-[#7C3AED]" />
              <span className="text-sm font-medium text-[#111827]">AI Diagnoses</span>
            </div>
            <span className="text-xs text-[#9CA3AF] capitalize">{plan} plan</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#7C3AED]">
            <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
            Generating your free diagnosis...
          </div>
        </div>
      );
    }

    // Auto failed — show free diagnosis available
    if (autoDiagStatus === "failed" && hasGsc && !hasFreeDiagnosis) {
      return (
        <div data-tour="usage-meter" className="bg-white rounded-lg border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={18} strokeWidth={1.5} className="text-[#2563EB]" />
              <span className="text-sm font-medium text-[#111827]">AI Diagnoses</span>
            </div>
            <span className="text-xs text-[#9CA3AF] capitalize">{plan} plan</span>
          </div>
          <p className="text-sm text-[#374151] mb-3">
            You have <strong className="text-[#2563EB]">1 free AI diagnosis</strong>. Pick any page to analyze.
          </p>
          <Link
            href="/pages"
            className="block w-full text-center text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg py-2 transition-colors"
          >
            Use your free diagnosis
          </Link>
        </div>
      );
    }

    // Completed or used — show upgrade
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

      <div className="mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-[28px] font-bold text-[#111827] leading-none">{used}/{limit}</span>
        </div>
        <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mt-1">diagnoses this month</p>
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
