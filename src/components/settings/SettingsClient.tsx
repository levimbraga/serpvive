"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  CreditCard, ExternalLink, Loader2, AlertTriangle,
  CheckCircle2, Crown, Zap, Globe, FileText, BarChart3,
  Unlink, Plus, ArrowUpRight, Key, Trash2, Clock, Calendar, Mail,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { PLAN_LIMITS, type PlanName } from "@/lib/constants";

type SiteInfo = {
  id: string;
  domain: string;
  status: string;
  pages_count: number;
  health_score: number | null;
};

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  active:    { label: "Active",    bg: "bg-[#F0FDF4]", text: "text-[#16A34A]" },
  importing: { label: "Importing", bg: "bg-[#FEF3C7]", text: "text-[#D97706]" },
  paused:    { label: "Paused",    bg: "bg-[#F3F4F6]", text: "text-[#6B7280]" },
  error:     { label: "Error",     bg: "bg-[#FEF2F2]", text: "text-[#DC2626]" },
};

const PLAN_DISPLAY: Record<PlanName, { label: string; monthlyPrice: string; annualPrice: string; color: string }> = {
  free:    { label: "Free", monthlyPrice: "Free", annualPrice: "Free", color: "#6B7280" },
  starter: { label: "Starter", monthlyPrice: "$29/mo", annualPrice: "$24/mo", color: "#0D9488" },
  pro:     { label: "Pro", monthlyPrice: "$69/mo", annualPrice: "$58/mo", color: "#2563EB" },
  agency:  { label: "Agency", monthlyPrice: "$129/mo", annualPrice: "$108/mo", color: "#7C3AED" },
};

const PLAN_ORDER: PlanName[] = ["free", "starter", "pro", "agency"];

const PLANS_FOR_UPGRADE: { key: PlanName; label: string; monthly: number; annual: number; annualTotal: number; features: string[] }[] = [
  {
    key: "starter",
    label: "Starter",
    monthly: 29,
    annual: 24,
    annualTotal: 290,
    features: ["1 site", "100 pages", "10 diagnoses/mo", "Daily monitoring", "Weekly email digest"],
  },
  {
    key: "pro",
    label: "Pro",
    monthly: 69,
    annual: 58,
    annualTotal: 690,
    features: ["3 sites", "1,000 pages", "40 diagnoses/mo", "Daily monitoring", "Weekly email digest"],
  },
  {
    key: "agency",
    label: "Agency",
    monthly: 129,
    annual: 108,
    annualTotal: 1290,
    features: ["10 sites", "5,000 pages", "120 diagnoses/mo", "Daily monitoring", "Priority support"],
  },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern (US)" },
  { value: "America/Chicago", label: "Central (US)" },
  { value: "America/Denver", label: "Mountain (US)" },
  { value: "America/Los_Angeles", label: "Pacific (US)" },
  { value: "America/Sao_Paulo", label: "São Paulo" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris / Berlin" },
  { value: "Europe/Istanbul", label: "Istanbul" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
];

const DIGEST_DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
];

export default function SettingsClient({
  email,
  fullName,
  plan,
  planStatus,
  diagnosesUsed,
  diagnosesLimit,
  hasStripeCustomer,
  sites,
  sitesLimit,
  timezone,
  digestDay,
  emailUnsubscribed,
  billingInterval,
  authProvider,
}: {
  email: string;
  fullName: string | null;
  plan: PlanName;
  planStatus: string;
  diagnosesUsed: number;
  diagnosesLimit: number;
  hasStripeCustomer: boolean;
  sites: SiteInfo[];
  sitesLimit: number;
  timezone: string;
  digestDay: string;
  emailUnsubscribed: boolean;
  billingInterval: "monthly" | "annual";
  authProvider: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowser();
  const checkoutStatus = searchParams.get("checkout");
  const upgradeStatus = searchParams.get("upgrade");

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [syncingPlan, setSyncingPlan] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Disconnect site state
  const [disconnectSite, setDisconnectSite] = useState<SiteInfo | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  // Account editing state
  const [editName, setEditName] = useState(fullName ?? "");
  const [savingName, setSavingName] = useState(false);

  // Password state
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Timezone/digest/email state
  const [currentTimezone, setCurrentTimezone] = useState(timezone);
  const [currentDigestDay, setCurrentDigestDay] = useState(digestDay);
  const [emailOff, setEmailOff] = useState(emailUnsubscribed);

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const planInfo = PLAN_DISPLAY[plan];
  const limits = PLAN_LIMITS[plan];
  const usagePercent = diagnosesLimit > 0 ? Math.min(100, (diagnosesUsed / diagnosesLimit) * 100) : 0;
  const isPasswordAuth = authProvider === "email";

  // Plans available for upgrade
  const currentPlanIndex = PLAN_ORDER.indexOf(plan);
  const upgradePlans = PLANS_FOR_UPGRADE.filter((p) => {
    const targetIndex = PLAN_ORDER.indexOf(p.key);
    return targetIndex > currentPlanIndex;
  });

  const canAddSite = sites.length < sitesLimit;

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  }

  // ── Account actions ──

  async function handleSaveName() {
    setSavingName(true);
    setError("");
    const { error: err } = await supabase
      .from("profiles")
      .update({ full_name: editName.trim() || null })
      .eq("id", (await supabase.auth.getUser()).data.user!.id);

    if (err) {
      setError("Failed to update name");
    } else {
      flash("Name updated");
      router.refresh();
    }
    setSavingName(false);
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSavingPassword(true);
    setError("");
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });

    if (err) {
      setError(err.message);
    } else {
      flash("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
    }
    setSavingPassword(false);
  }

  async function handleTimezoneChange(tz: string) {
    setCurrentTimezone(tz);
    const { error: err } = await supabase
      .from("profiles")
      .update({ timezone: tz })
      .eq("id", (await supabase.auth.getUser()).data.user!.id);

    if (err) setError("Failed to update timezone");
    else flash("Timezone updated");
  }

  async function handleDigestDayChange(day: string) {
    setCurrentDigestDay(day);
    const { error: err } = await supabase
      .from("profiles")
      .update({ digest_day: day })
      .eq("id", (await supabase.auth.getUser()).data.user!.id);

    if (err) setError("Failed to update digest day");
    else flash("Digest day updated");
  }

  async function handleEmailToggle() {
    const newValue = !emailOff;
    setEmailOff(newValue);
    try {
      const res = await fetch("/api/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unsubscribed: newValue }),
      });
      if (!res.ok) throw new Error();
      flash(newValue ? "Emails disabled" : "Emails re-enabled");
    } catch {
      setEmailOff(!newValue); // rollback
      setError("Failed to update email preference");
    }
  }

  // ── Billing actions ──

  async function handleUpgrade(planKey: PlanName) {
    const interval = isAnnual ? "annual" : "monthly";
    posthog.capture("upgrade_clicked", { from: "settings", current_plan: plan, target_plan: planKey, interval });
    setLoadingPlan(planKey);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, interval }),
      });
      const json = (await res.json()) as { data?: { url: string }; error?: string };
      if (!res.ok) { setError(json.error ?? "Failed to create checkout"); return; }
      if (json.data?.url) window.location.href = json.data.url;
    } catch { setError("Network error"); }
    finally { setLoadingPlan(null); }
  }

  async function handleSyncPlan() {
    setSyncingPlan(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/sync-plan", { method: "POST" });
      const json = (await res.json()) as { data?: { plan: string; planStatus: string; synced: boolean }; error?: string };
      if (!res.ok) { setError(json.error ?? "Failed to sync plan"); return; }
      flash("Plan status refreshed");
      router.refresh();
    } catch { setError("Network error"); }
    finally { setSyncingPlan(false); }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = (await res.json()) as { data?: { url: string }; error?: string };
      if (!res.ok) { setError(json.error ?? "Failed to open billing portal"); return; }
      if (json.data?.url) window.location.href = json.data.url;
    } catch { setError("Network error"); }
    finally { setPortalLoading(false); }
  }

  // ── Site actions ──

  async function handleDisconnect() {
    if (!disconnectSite) return;
    setDisconnecting(true);
    setError("");
    try {
      const res = await fetch(`/api/sites/${disconnectSite.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setError(json.error ?? "Failed to disconnect site");
        setDisconnecting(false);
        setDisconnectSite(null);
        return;
      }
      setDisconnectSite(null);
      setDisconnecting(false);
      if (sites.length <= 1) router.push("/onboarding");
      else router.refresh();
    } catch {
      setError("Network error");
      setDisconnecting(false);
      setDisconnectSite(null);
    }
  }

  function handleAddSite() {
    router.push("/api/auth/google-gsc?redirect=settings");
  }

  // ── Delete account ──

  async function handleDeleteAccount() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setError(json.error ?? "Failed to delete account");
        setDeleting(false);
        return;
      }
      await supabase.auth.signOut();
      window.location.href = "/?deleted=true";
    } catch {
      setError("Network error");
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-[#111827]">Settings</h1>

      {/* Banners */}
      {(checkoutStatus === "success" || upgradeStatus === "success") && (
        <div className="flex items-center gap-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4">
          <CheckCircle2 size={20} strokeWidth={1.5} className="text-[#16A34A] flex-shrink-0" />
          <p className="text-sm text-[#16A34A] font-medium">Plan updated successfully! Changes are now active.</p>
        </div>
      )}

      {upgradeStatus === "canceled" && (
        <div className="flex items-center gap-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4">
          <AlertTriangle size={20} strokeWidth={1.5} className="text-[#6B7280] flex-shrink-0" />
          <p className="text-sm text-[#6B7280] font-medium">Plan change was canceled. No changes were made.</p>
        </div>
      )}

      {plan === "free" && (
        <div className="flex items-center gap-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4">
          <Zap size={20} strokeWidth={1.5} className="text-[#D97706] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#92400E]">
              {hasStripeCustomer ? "Your paid plan was canceled" : "You\u2019re on the free plan"}
            </p>
            <p className="text-xs text-[#B45309] mt-0.5">
              {hasStripeCustomer
                ? "Your data syncs weekly. Choose a plan to resume daily monitoring and AI diagnoses."
                : "Upgrade to unlock daily monitoring, AI diagnoses, and weekly email digests."}
            </p>
          </div>
        </div>
      )}

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
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {success && (
        <div className="flex items-center gap-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4">
          <CheckCircle2 size={16} strokeWidth={1.5} className="text-[#16A34A] flex-shrink-0" />
          <p className="text-sm text-[#16A34A] font-medium">{success}</p>
        </div>
      )}

      {/* ── Connected Sites ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#111827]">Connected Sites</h2>
          <span className="text-xs text-[#9CA3AF] tabular-nums">{sites.length} / {sitesLimit}</span>
        </div>

        {sites.length === 0 ? (
          <div className="text-center py-6">
            <Globe size={32} strokeWidth={1.5} className="text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-sm text-[#6B7280] mb-3">No sites connected yet.</p>
            <button
              onClick={handleAddSite}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-medium transition-colors"
            >
              <Plus size={14} strokeWidth={1.5} />
              Connect Google Search Console
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sites.map((site) => {
              const badge = STATUS_BADGE[site.status] ?? { label: "Unknown", bg: "bg-[#F3F4F6]", text: "text-[#6B7280]" };
              return (
                <div key={site.id} className="flex items-center gap-4 p-4 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                    <Globe size={16} strokeWidth={1.5} className="text-[#6B7280]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{site.domain}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>{badge.label}</span>
                      <span className="text-xs text-[#9CA3AF]">{site.pages_count} pages</span>
                      {site.health_score !== null && (
                        <span className="text-xs text-[#9CA3AF]">Health: {site.health_score}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setDisconnectSite(site)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#FECACA] text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition-colors flex-shrink-0"
                  >
                    <Unlink size={12} strokeWidth={1.5} />
                    Disconnect
                  </button>
                </div>
              );
            })}

            <div className="pt-2">
              {canAddSite ? (
                <button
                  onClick={handleAddSite}
                  className="flex items-center gap-2 h-9 px-4 rounded-lg border border-dashed border-[#D1D5DB] text-sm text-[#6B7280] hover:border-[#0D9488] hover:text-[#0D9488] transition-colors"
                >
                  <Plus size={14} strokeWidth={1.5} />
                  Add site
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                  <span>Site limit reached ({sitesLimit}/{sitesLimit}).</span>
                  {upgradePlans.length > 0 && (
                    <button
                      onClick={() => document.getElementById("upgrade-section")?.scrollIntoView({ behavior: "smooth" })}
                      className="text-[#0D9488] hover:underline inline-flex items-center gap-0.5"
                    >
                      Upgrade to add more
                      <ArrowUpRight size={10} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Disconnect confirmation dialog */}
      <Dialog open={!!disconnectSite} onOpenChange={(open) => !open && setDisconnectSite(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect {disconnectSite?.domain}?</DialogTitle>
            <DialogDescription>
              All data (pages, diagnoses, refreshes) will be permanently deleted. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDisconnectSite(null)}
              disabled={disconnecting}
              className="h-9 px-4 rounded-lg border border-[#E5E7EB] text-sm text-[#111827] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="h-9 px-4 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {disconnecting ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : <Unlink size={14} strokeWidth={1.5} />}
              Yes, disconnect
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Account ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <h2 className="text-sm font-semibold text-[#111827] mb-4">Account</h2>
        <div className="divide-y divide-[#F3F4F6]">
          {/* Email (read-only) */}
          <div className="flex items-center justify-between py-3 first:pt-0">
            <span className="text-sm text-[#6B7280]">Email</span>
            <span className="text-sm text-[#111827]">{email}</span>
          </div>

          {/* Name (editable) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-3">
            <span className="text-sm text-[#6B7280] flex-shrink-0">Name</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                className="h-8 w-full sm:w-48 px-3 text-sm text-[#111827] border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName || editName === (fullName ?? "")}
                className="h-8 px-3 rounded-lg bg-[#3B82F6] text-white text-xs font-medium hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {savingName ? <Loader2 size={12} className="animate-spin" /> : "Save"}
              </button>
            </div>
          </div>

          {/* Password (only for email auth) */}
          {isPasswordAuth && (
            <div className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">Password</span>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                >
                  <Key size={12} strokeWidth={1.5} />
                  {showPassword ? "Cancel" : "Change password"}
                </button>
              </div>
              {showPassword && (
                <div className="mt-3 space-y-2 pl-0">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 8 chars)"
                    className="h-9 w-full px-3 text-sm border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="h-9 w-full px-3 text-sm border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                  <button
                    onClick={handleChangePassword}
                    disabled={savingPassword || newPassword.length < 8}
                    className="h-9 px-4 rounded-lg bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {savingPassword && <Loader2 size={14} className="animate-spin" />}
                    Update password
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Timezone */}
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-[#6B7280] flex items-center gap-1.5">
              <Clock size={14} strokeWidth={1.5} />
              Timezone
            </span>
            <select
              value={currentTimezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="h-8 px-2 text-sm text-[#111827] border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] cursor-pointer"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          {/* Digest day */}
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-[#6B7280] flex items-center gap-1.5">
              <Calendar size={14} strokeWidth={1.5} />
              Weekly digest day
            </span>
            <select
              value={currentDigestDay}
              onChange={(e) => handleDigestDayChange(e.target.value)}
              disabled={emailOff}
              className="h-8 px-2 text-sm text-[#111827] border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] cursor-pointer disabled:opacity-50"
            >
              {DIGEST_DAYS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Email toggle */}
          <div className="flex items-center justify-between py-3 last:pb-0">
            <span className="text-sm text-[#6B7280] flex items-center gap-1.5">
              <Mail size={14} strokeWidth={1.5} />
              Email notifications
            </span>
            <button
              onClick={handleEmailToggle}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                emailOff ? "bg-[#D1D5DB]" : "bg-[#3B82F6]"
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                emailOff ? "" : "translate-x-5"
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Plan & Usage ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#111827]">Plan & Usage</h2>
          <div className="flex items-center gap-2">
            <Crown size={14} strokeWidth={1.5} style={{ color: planInfo.color }} />
            <span className="text-sm font-medium" style={{ color: planInfo.color }}>{planInfo.label}</span>
            <span className="text-xs text-[#9CA3AF]">
              {plan === "free" ? "Free" : billingInterval === "annual" ? planInfo.annualPrice : planInfo.monthlyPrice}
              {plan !== "free" && <span className="ml-1 text-[10px]">({billingInterval})</span>}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
          {[
            { icon: Globe, label: "Sites", value: limits.sites },
            { icon: FileText, label: "Pages", value: limits.pages.toLocaleString() },
            { icon: Zap, label: "Diagnoses/mo", value: limits.diagnoses_per_month, accent: true },
          ].map(({ icon: Icon, label, value, accent }) => (
            <div key={label} className="bg-[#F9FAFB] rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} strokeWidth={1.5} className={accent ? "text-[#7C3AED]" : "text-[#6B7280]"} />
                <p className="text-xs text-[#6B7280]">{label}</p>
              </div>
              <p className="text-lg font-bold text-[#111827] tabular-nums">{value}</p>
            </div>
          ))}
        </div>

        {/* Monitoring frequency */}
        <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-[#F3F4F6]">
          <span className="text-[#6B7280]">Monitoring</span>
          <span className="text-[#111827] font-medium">
            {plan === "free" ? "Weekly sync" : "Daily sync"}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7280] flex items-center gap-1.5">
              <BarChart3 size={14} strokeWidth={1.5} className="text-[#7C3AED]" />
              AI Diagnoses
            </span>
            <span className="text-[#111827] tabular-nums">
              {plan === "free" ? "Upgrade to unlock" : `${diagnosesUsed} / ${diagnosesLimit}`}
            </span>
          </div>
          {plan !== "free" && (
            <>
              <Progress value={usagePercent} className="h-2" />
              <p className="text-xs text-[#9CA3AF]">Resets monthly</p>
            </>
          )}
        </div>

        {hasStripeCustomer && (
          <div className="mt-5 pt-4 border-t border-[#F3F4F6] space-y-3">
            {plan !== "free" ? (
              <>
                <button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-[#E5E7EB] text-sm text-[#111827] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
                >
                  {portalLoading ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : <CreditCard size={14} strokeWidth={1.5} />}
                  Manage Billing
                  <ExternalLink size={12} strokeWidth={1.5} className="text-[#9CA3AF]" />
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                    className="flex-1 text-center text-xs text-[#9CA3AF] hover:text-[#DC2626] transition-colors disabled:opacity-50"
                  >
                    Cancel subscription
                  </button>
                  <button
                    onClick={handleSyncPlan}
                    disabled={syncingPlan}
                    className="text-xs text-[#9CA3AF] hover:text-[#3B82F6] transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {syncingPlan ? <Loader2 size={10} className="animate-spin" /> : null}
                    Refresh plan status
                  </button>
                </div>
                <p className="text-[10px] text-[#D1D5DB] text-center">
                  If you cancel, you&apos;ll keep access on the free plan with weekly syncs.
                </p>
              </>
            ) : (
              <button
                onClick={() => document.getElementById("upgrade-section")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-medium transition-colors"
              >
                <Zap size={14} strokeWidth={1.5} />
                Reactivate — Choose a Plan
              </button>
            )}
          </div>
        )}

        {!hasStripeCustomer && plan === "free" && (
          <div className="mt-5 pt-4 border-t border-[#F3F4F6]">
            <button
              onClick={() => document.getElementById("upgrade-section")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-medium transition-colors"
            >
              <Zap size={14} strokeWidth={1.5} />
              Choose a Plan
            </button>
          </div>
        )}
      </div>

      {/* ── Upgrade ── */}
      {upgradePlans.length > 0 && (
        <div id="upgrade-section" className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#111827]">
              {plan === "free" ? "Choose a plan" : "Upgrade"}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${!isAnnual ? "text-[#111827]" : "text-[#9CA3AF]"}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                style={{ background: isAnnual ? "#0D9488" : "#D1D5DB" }}
                aria-label="Toggle annual billing"
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: isAnnual ? 22 : 2 }}
                />
              </button>
              <span className={`text-xs font-medium ${isAnnual ? "text-[#111827]" : "text-[#9CA3AF]"}`}>Annual</span>
              {isAnnual && (
                <span className="text-[10px] font-bold text-white bg-[#0D9488] px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              )}
            </div>
          </div>
          <div className={`grid grid-cols-1 ${upgradePlans.length >= 3 ? "sm:grid-cols-3" : upgradePlans.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1 max-w-sm"} gap-4`}>
            {upgradePlans.map((p) => {
              const price = isAnnual ? p.annual : p.monthly;
              const savings = (p.monthly * 12) - p.annualTotal;

              return (
                <div key={p.key} className="border border-[#E5E7EB] rounded-xl p-4 flex flex-col">
                  <p className="font-semibold text-[#111827]">{p.label}</p>
                  <div className="mt-1">
                    {isAnnual && (
                      <span className="text-lg text-[#9CA3AF] line-through mr-2">${p.monthly}</span>
                    )}
                    <span className="text-2xl font-bold text-[#111827]">${price}</span>
                    <span className="text-sm font-normal text-[#6B7280]">/mo</span>
                  </div>
                  {isAnnual && (
                    <p className="text-[11px] text-[#0D9488] font-medium mt-0.5">
                      Billed as ${p.annualTotal}/yr — save ${savings}/yr
                    </p>
                  )}
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
                    {loadingPlan === p.key ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : "Upgrade"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Danger Zone: Delete Account ── */}
      <div className="bg-white rounded-xl border border-[#FECACA] p-6 mt-2">
        <h2 className="text-sm font-semibold text-[#DC2626] mb-2">Danger Zone</h2>
        <p className="text-xs text-[#6B7280] mb-4">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-lg border border-[#FECACA] text-sm font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
        >
          <Trash2 size={14} strokeWidth={1.5} />
          Delete account
        </button>
      </div>

      {/* Delete account dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => { if (!open) { setShowDeleteDialog(false); setDeleteConfirm(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, all sites, pages, diagnoses, and cancel your subscription. Type <strong>DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder='Type "DELETE" to confirm'
            className="h-10 w-full px-3 text-sm border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
          />
          <DialogFooter>
            <button
              onClick={() => { setShowDeleteDialog(false); setDeleteConfirm(""); }}
              disabled={deleting}
              className="h-9 px-4 rounded-lg border border-[#E5E7EB] text-sm text-[#111827] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirm !== "DELETE"}
              className="h-9 px-4 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {deleting ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : <Trash2 size={14} strokeWidth={1.5} />}
              Delete forever
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
