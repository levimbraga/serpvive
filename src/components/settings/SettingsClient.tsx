"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard, ExternalLink, Loader2, AlertTriangle,
  CheckCircle2, Crown, Zap,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { PlanName } from "@/lib/constants";

const PLAN_DISPLAY: Record<PlanName, { label: string; price: string; color: string }> = {
  trial:   { label: "Trial", price: "Free", color: "#6B7280" },
  starter: { label: "Starter", price: "$29/mo", color: "#0D9488" },
  pro:     { label: "Pro", price: "$59/mo", color: "#2563EB" },
  agency:  { label: "Agency", price: "$99/mo", color: "#7C3AED" },
};

const PLANS_FOR_UPGRADE: { key: PlanName; label: string; price: number; features: string[] }[] = [
  {
    key: "starter",
    label: "Starter",
    price: 29,
    features: ["1 site", "100 pages", "10 diagnoses/mo"],
  },
  {
    key: "pro",
    label: "Pro",
    price: 59,
    features: ["3 sites", "500 pages", "50 diagnoses/mo", "Velocity alerts", "CSV export"],
  },
  {
    key: "agency",
    label: "Agency",
    price: 99,
    features: ["10 sites", "2,000 pages", "150 diagnoses/mo", "Client dashboards", "Priority support"],
  },
];

export default function SettingsClient({
  email,
  fullName,
  plan,
  planStatus,
  diagnosesUsed,
  diagnosesLimit,
  trialEndsAt,
  hasStripeCustomer,
}: {
  email: string;
  fullName: string | null;
  plan: PlanName;
  planStatus: string;
  diagnosesUsed: number;
  diagnosesLimit: number;
  trialEndsAt: string | null;
  hasStripeCustomer: boolean;
}) {
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");

  const planInfo = PLAN_DISPLAY[plan];
  const usagePercent = diagnosesLimit > 0 ? Math.min(100, (diagnosesUsed / diagnosesLimit) * 100) : 0;

  // Trial expired check
  const trialExpired = plan === "trial" && trialEndsAt && new Date(trialEndsAt) < new Date();
  const trialDaysLeft = plan === "trial" && trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  async function handleUpgrade(planKey: PlanName) {
    setLoadingPlan(planKey);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      const json = (await res.json()) as { data?: { url: string }; error?: string };

      if (!res.ok) {
        setError(json.error ?? "Failed to create checkout");
        return;
      }

      if (json.data?.url) {
        window.location.href = json.data.url;
      }
    } catch {
      setError("Network error");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const json = (await res.json()) as { data?: { url: string }; error?: string };

      if (!res.ok) {
        setError(json.error ?? "Failed to open billing portal");
        return;
      }

      if (json.data?.url) {
        window.location.href = json.data.url;
      }
    } catch {
      setError("Network error");
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-[#111827]">Settings</h1>

      {/* Checkout success/cancel banner */}
      {checkoutStatus === "success" && (
        <div className="flex items-center gap-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4">
          <CheckCircle2 size={20} strokeWidth={1.5} className="text-[#16A34A] flex-shrink-0" />
          <p className="text-sm text-[#16A34A] font-medium">Payment successful! Your plan has been upgraded.</p>
        </div>
      )}

      {/* Trial expired banner */}
      {trialExpired && (
        <div className="flex items-center gap-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4">
          <AlertTriangle size={20} strokeWidth={1.5} className="text-[#DC2626] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#DC2626]">Trial expired</p>
            <p className="text-xs text-[#6B7280] mt-0.5">Upgrade to continue using AI diagnoses.</p>
          </div>
        </div>
      )}

      {/* Past due banner */}
      {planStatus === "past_due" && (
        <div className="flex items-center gap-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4">
          <AlertTriangle size={20} strokeWidth={1.5} className="text-[#D97706] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#D97706]">Payment past due</p>
            <p className="text-xs text-[#6B7280] mt-0.5">Please update your payment method to avoid service interruption.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Account info */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <h2 className="text-sm font-semibold text-[#111827] mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B7280]">Email</span>
            <span className="text-sm text-[#111827]">{email}</span>
          </div>
          {fullName && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B7280]">Name</span>
              <span className="text-sm text-[#111827]">{fullName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Current plan + usage */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#111827]">Plan & Usage</h2>
          <div className="flex items-center gap-2">
            <Crown size={14} strokeWidth={1.5} style={{ color: planInfo.color }} />
            <span className="text-sm font-medium" style={{ color: planInfo.color }}>
              {planInfo.label}
            </span>
            <span className="text-xs text-[#9CA3AF]">{planInfo.price}</span>
          </div>
        </div>

        {plan === "trial" && trialDaysLeft !== null && !trialExpired && (
          <p className="text-xs text-[#6B7280] mb-4">
            {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining in trial
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7280] flex items-center gap-1.5">
              <Zap size={14} strokeWidth={1.5} className="text-[#7C3AED]" />
              AI Diagnoses
            </span>
            <span className="text-[#111827] tabular-nums">{diagnosesUsed} / {diagnosesLimit}</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          <p className="text-xs text-[#9CA3AF]">Resets monthly</p>
        </div>

        {/* Manage billing button (for paying customers) */}
        {hasStripeCustomer && plan !== "trial" && (
          <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="flex items-center gap-2 text-sm text-[#3B82F6] hover:text-[#1D4ED8] transition-colors disabled:opacity-50"
            >
              {portalLoading ? (
                <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
              ) : (
                <CreditCard size={14} strokeWidth={1.5} />
              )}
              Manage Billing
              <ExternalLink size={12} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      {/* Upgrade plans (show for trial or if user wants to upgrade) */}
      {(plan === "trial" || plan === "starter") && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-sm font-semibold text-[#111827] mb-4">
            {plan === "trial" ? "Choose a plan" : "Upgrade"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS_FOR_UPGRADE.filter((p) => {
              if (plan === "starter") return p.key !== "starter";
              return true;
            }).map((p) => (
              <div
                key={p.key}
                className="border border-[#E5E7EB] rounded-xl p-4 flex flex-col"
              >
                <p className="font-semibold text-[#111827]">{p.label}</p>
                <p className="text-2xl font-bold text-[#111827] mt-1">
                  ${p.price}<span className="text-sm font-normal text-[#6B7280]">/mo</span>
                </p>
                <ul className="mt-3 space-y-1.5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="text-xs text-[#4B5563] flex items-center gap-1.5">
                      <CheckCircle2 size={12} strokeWidth={1.5} className="text-[#16A34A] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(p.key)}
                  disabled={loadingPlan !== null}
                  className="mt-4 w-full h-9 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingPlan === p.key ? (
                    <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                  ) : (
                    "Get Started"
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
