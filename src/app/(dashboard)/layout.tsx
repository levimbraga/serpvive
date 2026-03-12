import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getActiveSiteId } from "@/lib/active-site";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { PostHogIdentify } from "@/lib/posthog/identify";
import { PLAN_LIMITS, type PlanName } from "@/lib/constants";

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
      .select("id, domain, status, health_score")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  const profile = profileRes.data;
  const plan = (profile?.plan ?? "free") as PlanName;
  const diagnosesUsed = profile?.diagnoses_used_this_month ?? 0;
  const diagnosesLimit = PLAN_LIMITS[plan]?.diagnoses_per_month ?? 3;
  const sites = sitesRes.data ?? [];

  // Onboarding re-entry: redirect users who abandoned onboarding
  const headersList = await headers();
  const pathname = headersList.get("x-next-pathname") ?? headersList.get("x-invoke-path") ?? "";
  const isOnboardingPage = pathname.includes("/onboarding");

  if (!isOnboardingPage && sites.length === 0) {
    // No sites — needs to connect GSC
    redirect("/onboarding");
  }

  if (!isOnboardingPage && sites.length > 0) {
    const firstSite = sites[0]!;
    if (firstSite.status === "importing") {
      redirect("/onboarding/importing");
    }
  }

  const activeSiteId = await getActiveSiteId(supabase, user.id);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <PostHogIdentify userId={user.id} email={user.email ?? ""} plan={plan} />
      <Sidebar
        diagnosesUsed={diagnosesUsed}
        diagnosesLimit={diagnosesLimit}
        sites={sites}
        activeSiteId={activeSiteId}
      />
      <div className="sm:ml-[200px]">
        <DashboardHeader
          sites={sites}
          activeSiteId={activeSiteId}
          userEmail={user.email ?? ""}
          diagnosesUsed={diagnosesUsed}
          diagnosesLimit={diagnosesLimit}
        />
        <main className="p-4 sm:p-6 max-w-[1200px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
