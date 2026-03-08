import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

const PLAN_LIMITS: Record<string, number> = {
  trial: 3,
  starter: 10,
  pro: 50,
  agency: 150,
};

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, diagnoses_used_this_month")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan ?? "trial";
  const diagnosesUsed = profile?.diagnoses_used_this_month ?? 0;
  const diagnosesLimit = PLAN_LIMITS[plan] ?? 3;

  // Get active site name
  const { data: site } = await supabase
    .from("sites")
    .select("domain")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Sidebar diagnosesUsed={diagnosesUsed} diagnosesLimit={diagnosesLimit} />
      <div className="ml-[60px]">
        <DashboardHeader
          siteName={site?.domain ?? ""}
          userEmail={user.email ?? ""}
        />
        <main className="p-6 max-w-[1200px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
