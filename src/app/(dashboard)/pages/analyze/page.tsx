import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { PLAN_LIMITS, type PlanName, isAdmin, FREE_LIFETIME_URL_ANALYSES } from "@/lib/constants";
import AnalyzeUrlClient from "@/components/pages/AnalyzeUrlClient";

export const metadata: Metadata = {
  title: "Analyze any page — SerpVive",
};

export default async function AnalyzeUrlPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, diagnoses_used_this_month")
    .eq("id", user.id)
    .single();

  const plan = (isAdmin(user.email) ? "agency" : (profile?.plan ?? "free")) as PlanName;

  // Free plan: lifetime cap of 1 standalone URL analysis, counted from
  // external_analyses rows (mirrors the check in /api/analyze-url).
  let diagnosesUsed = profile?.diagnoses_used_this_month ?? 0;
  let diagnosesLimit: number = PLAN_LIMITS[plan]?.diagnoses_per_month ?? 0;

  if (plan === "free") {
    const { count } = await supabase
      .from("external_analyses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    diagnosesUsed = count ?? 0;
    diagnosesLimit = FREE_LIFETIME_URL_ANALYSES;
  }

  return (
    <AnalyzeUrlClient
      diagnosesUsed={diagnosesUsed}
      diagnosesLimit={diagnosesLimit}
      plan={plan}
    />
  );
}
