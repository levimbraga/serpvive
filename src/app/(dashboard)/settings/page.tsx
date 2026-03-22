import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { PLAN_LIMITS, type PlanName, isAdmin } from "@/lib/constants";
import SettingsClient from "@/components/settings/SettingsClient";

export const metadata: Metadata = {
  title: "Settings — SerpVive",
};

export default async function SettingsPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_status, diagnoses_used_this_month, stripe_customer_id, email, full_name, timezone, digest_day, email_unsubscribed, pending_plan, plan_changes_at, billing_interval")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const plan = (isAdmin(user.email) ? "agency" : (profile.plan ?? "free")) as PlanName;
  const limits = PLAN_LIMITS[plan];

  // Fetch user's sites
  const { data: sites } = await supabase
    .from("sites")
    .select("id, domain, status, pages_count, health_score")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // Detect auth provider (google = no password change)
  const authProvider = user.app_metadata?.provider ?? "email";

  return (
    <SettingsClient
      email={profile.email}
      fullName={profile.full_name}
      plan={plan}
      planStatus={profile.plan_status ?? "active"}
      diagnosesUsed={profile.diagnoses_used_this_month ?? 0}
      diagnosesLimit={limits.diagnoses_per_month}
      hasStripeCustomer={!!profile.stripe_customer_id}
      sites={sites ?? []}
      sitesLimit={limits.sites}
      timezone={profile.timezone ?? "UTC"}
      digestDay={profile.digest_day ?? "monday"}
      emailUnsubscribed={profile.email_unsubscribed ?? false}
      pendingPlan={profile.pending_plan ?? null}
      planChangesAt={profile.plan_changes_at ?? null}
      billingInterval={profile.billing_interval === "annual" ? "annual" : "monthly"}
      authProvider={authProvider}
    />
  );
}
