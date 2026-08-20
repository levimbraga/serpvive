import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getActiveSiteId } from "@/lib/active-site";
import { touchLastSeen, wakeDormantSites, DORMANT_AFTER_DAYS } from "@/lib/activity";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { PostHogIdentify } from "@/lib/posthog/identify";
import { PLAN_LIMITS, type PlanName, isAdmin, FREE_LIFETIME_DIAGNOSES } from "@/lib/constants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileRes, sitesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("plan, diagnoses_used_this_month, last_seen_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("sites")
      .select("id, domain, status, health_score, has_free_diagnosis, auto_diagnosis_status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  const profile = profileRes.data;
  const plan = (isAdmin(user.email) ? "agency" : (profile?.plan ?? "free")) as PlanName;
  let diagnosesUsed = profile?.diagnoses_used_this_month ?? 0;
  const sites = sitesRes.data ?? [];
  let diagnosesLimit: number = PLAN_LIMITS[plan]?.diagnoses_per_month ?? 0;

  // Free plan: lifetime allowance, counted from diagnoses rows so the sidebar
  // reads "X/10" from the first visit rather than after the first run.
  if (plan === "free") {
    const { count } = await supabase
      .from("diagnoses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    diagnosesUsed = count ?? 0;
    diagnosesLimit = FREE_LIFETIME_DIAGNOSES;
  }
  // Records the visit for the inactivity pause; at most one write per day.
  const lastSeenAt = profile?.last_seen_at as string | undefined;
  await touchLastSeen(supabase, user.id, lastSeenAt);

  // Password logins never touch /callback, so the wake-up also runs here —
  // but only when the gap is long enough for sites to have gone dormant, so
  // the common page load costs nothing extra.
  if (lastSeenAt) {
    // Server component rendered per request — Date.now() is a request
    // timestamp, not client-render state; the purity rule doesn't apply.
    // eslint-disable-next-line react-hooks/purity
    const daysAway = (Date.now() - new Date(lastSeenAt).getTime()) / 86_400_000;
    if (daysAway >= DORMANT_AFTER_DAYS) {
      await wakeDormantSites(supabase, user.id);
    }
  }

  const activeSiteId = await getActiveSiteId(supabase, user.id);
  const activeSite = sites.find((s) => s.id === activeSiteId);
  const hasFreeDiagnosis = !!(activeSite as { has_free_diagnosis?: boolean } | undefined)?.has_free_diagnosis;
  const hasGsc = sites.length > 0;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <PostHogIdentify userId={user.id} email={user.email ?? ""} plan={plan} sitesCount={sites.length} diagnosesUsed={diagnosesUsed} />
      <Sidebar
        diagnosesUsed={diagnosesUsed}
        diagnosesLimit={diagnosesLimit}
        plan={plan}
        sites={sites}
        activeSiteId={activeSiteId}
        isAdmin={isAdmin(user.email)}
        hasFreeDiagnosis={hasFreeDiagnosis}
        hasGsc={hasGsc}
        autoDiagStatus={(activeSite as { auto_diagnosis_status?: string } | undefined)?.auto_diagnosis_status ?? "pending"}
      />
      <div className="sm:ml-[200px]">
        <DashboardHeader
          sites={sites}
          activeSiteId={activeSiteId}
          userEmail={user.email ?? ""}
          diagnosesUsed={diagnosesUsed}
          diagnosesLimit={diagnosesLimit}
        />
        <main className="p-4 sm:p-6 mx-auto" style={{ maxWidth: "min(1600px, 95vw)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
