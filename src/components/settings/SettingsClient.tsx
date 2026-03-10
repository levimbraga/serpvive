"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  CreditCard, ExternalLink, Loader2, AlertTriangle,
  CheckCircle2, Crown, Zap, Globe, FileText, Users, BarChart3,
  Unlink, Plus, ArrowUpRight, Key, Trash2, Clock, Calendar,
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

const PLAN_DISPLAY: Record<PlanName, { label: string; price: string; color: string }> = {
  trial:   { label: "Trial", price: "Free", color: "#6B7280" },
  starter: { label: "Starter", price: "$29/mo", color: "#0D9488" },
  pro:     { label: "Pro", price: "$69/mo", color: "#2563EB" },
  agency:  { label: "Agency", price: "$129/mo", color: "#7C3AED" },
};

const PLAN_ORDER: PlanName[] = ["trial", "starter", "pro", "agency"];

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
    price: 69,
    features: ["3 sites", "500 pages", "40 diagnoses/mo", "Velocity alerts", "CSV export"],
  },
  {
    key: "agency",
    label: "Agency",
    price: 129,
    features: ["10 sites", "2,000 pages", "120 diagnoses/mo", "Client dashboards", "Priority support"],
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
  trialEndsAt,
  hasStripeCustomer,
  sites,
  sitesLimit,
  timezone,
  digestDay,
  authProvider,
}: {
  email: string;
  fullName: string | null;
  plan: PlanName;
  planStatus: string;
  diagnosesUsed: number;
  diagnosesLimit: number;
  trialEndsAt: string | null;
  hasStripeCustomer: boolean;
  sites: SiteInfo[];
  sitesLimit: number;
  timezone: string;
  digestDay: string;
  authProvider: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowser();
  const checkoutStatus = searchParams.get("checkout");

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
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

  // Timezone/digest state
  const [currentTimezone, setCurrentTimezone] = useState(timezone);
  const [currentDigestDay, setCurrentDigestDay] = useState(digestDay);

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const planInfo = PLAN_DISPLAY[plan];
  const limits = PLAN_LIMITS[plan];
  const usagePercent = diagnosesLimit > 0 ? Math.min(100, (diagnosesUsed / diagnosesLimit) * 100) : 0;
  const isPasswordAuth = authProvider === "email";

  // Trial expired check
  const trialExpired = plan === "trial" && trialEndsAt && new Date(trialEndsAt) < new Date();
  const trialDaysLeft = plan === "trial" && trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

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

  // ── Billing actions ──

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
      if (!res.ok) { setError(json.error ?? "Failed to create checkout"); return; }
      if (json.data?.url) window.location.href = json.data.url;
    } catch { setError("Network error"); }
    finally { setLoadingPlan(null); }
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
      {checkoutStatus === "success" && (
        <div className="flex items-center gap-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4">
          <CheckCircle2 size={20} strokeWidth={1.5} className="text-[#16A34A] flex-shrink-0" />
          <p className="text-sm text-[#16A34A] font-medium">Payment successful! Your plan has been upgraded.</p>
        </div>
      )}

      {trialExpired && (
        <div className="flex items-center gap-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4">
          <AlertTriangle size={20} strokeWidth={1.5} className="text-[#DC2626] flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#DC2626]">Trial expired</p>
            <p className="text-xs text-[#6B7280] mt-0.5">Upgrade to continue using AI diagnoses.</p>
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
          <div className="flex items-center justify-between gap-4 py-3">
            <span className="text-sm text-[#6B7280] flex-shrink-0">Name</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                className="h-8 w-48 px-3 text-sm text-[#111827] border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
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
          <div className="flex items-center justify-between py-3 last:pb-0">
            <span className="text-sm text-[#6B7280] flex items-center gap-1.5">
              <Calendar size={14} strokeWidth={1.5} />
              Weekly digest day
            </span>
            <select
              value={currentDigestDay}
              onChange={(e) => handleDigestDayChange(e.target.value)}
              className="h-8 px-2 text-sm text-[#111827] border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] cursor-pointer"
            >
              {DIGEST_DAYS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
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
            <span className="text-xs text-[#9CA3AF]">{planInfo.price}</span>
          </div>
        </div>

        {plan === "trial" && trialDaysLeft !== null && !trialExpired && (
          <p className="text-xs text-[#6B7280] mb-4">
            {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining in trial
          </p>
        )}

        <div className="grid grid-cols-4 gap-4 mb-5">
          {[
            { icon: Globe, label: "Sites", value: limits.sites },
            { icon: FileText, label: "Pages", value: limits.pages.toLocaleString() },
            { icon: Zap, label: "Diagnoses/mo", value: limits.diagnoses_per_month, accent: true },
            { icon: Users, label: "Team", value: limits.team_members },
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

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7280] flex items-center gap-1.5">
              <BarChart3 size={14} strokeWidth={1.5} className="text-[#7C3AED]" />
              AI Diagnoses used
            </span>
            <span className="text-[#111827] tabular-nums">{diagnosesUsed} / {diagnosesLimit}</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          <p className="text-xs text-[#9CA3AF]">Resets monthly</p>
        </div>

        {hasStripeCustomer && plan !== "trial" && (
          <div className="mt-5 pt-4 border-t border-[#F3F4F6]">
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-[#E5E7EB] text-sm text-[#111827] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
            >
              {portalLoading ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : <CreditCard size={14} strokeWidth={1.5} />}
              Manage Billing
              <ExternalLink size={12} strokeWidth={1.5} className="text-[#9CA3AF]" />
            </button>
          </div>
        )}
      </div>

      {/* ── Upgrade ── */}
      {upgradePlans.length > 0 && (
        <div id="upgrade-section" className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-sm font-semibold text-[#111827] mb-4">
            {plan === "trial" ? "Choose a plan" : "Upgrade"}
          </h2>
          <div className={`grid grid-cols-1 ${upgradePlans.length >= 3 ? "sm:grid-cols-3" : upgradePlans.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1 max-w-sm"} gap-4`}>
            {upgradePlans.map((p) => (
              <div key={p.key} className="border border-[#E5E7EB] rounded-xl p-4 flex flex-col">
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
                  {loadingPlan === p.key ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : "Upgrade"}
                </button>
              </div>
            ))}
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
