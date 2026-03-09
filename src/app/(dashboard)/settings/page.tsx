import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { PLAN_LIMITS, type PlanName } from "@/lib/constants";
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
    .select("plan, plan_status, diagnoses_used_this_month, trial_ends_at, stripe_customer_id, email, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const plan = (profile.plan ?? "trial") as PlanName;
  const limits = PLAN_LIMITS[plan];

  // Fetch user's sites
  const { data: sites } = await supabase
    .from("sites")
    .select("id, domain, status, pages_count, health_score")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <SettingsClient
      email={profile.email}
      fullName={profile.full_name}
      plan={plan}
      planStatus={profile.plan_status ?? "trialing"}
      diagnosesUsed={profile.diagnoses_used_this_month ?? 0}
      diagnosesLimit={limits.diagnoses_per_month}
      trialEndsAt={profile.trial_ends_at}
      hasStripeCustomer={!!profile.stripe_customer_id}
      sites={sites ?? []}
      sitesLimit={limits.sites}
    />
  );
}
