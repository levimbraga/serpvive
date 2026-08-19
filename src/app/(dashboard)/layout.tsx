import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getActiveSiteId } from "@/lib/active-site";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { PostHogIdentify } from "@/lib/posthog/identify";
import { PLAN_LIMITS, type PlanName, isAdmin } from "@/lib/constants";

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
      .select("plan, diagnoses_used_this_month")
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
  const diagnosesUsed = profile?.diagnoses_used_this_month ?? 0;
  const sites = sitesRes.data ?? [];
  const diagnosesLimit = PLAN_LIMITS[plan]?.diagnoses_per_month ?? 0;
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
