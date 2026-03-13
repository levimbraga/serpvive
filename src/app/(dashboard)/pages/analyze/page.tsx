import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { PLAN_LIMITS, type PlanName } from "@/lib/constants";
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

  const plan = (profile?.plan ?? "free") as PlanName;
  const diagnosesUsed = profile?.diagnoses_used_this_month ?? 0;
  const diagnosesLimit = PLAN_LIMITS[plan]?.diagnoses_per_month ?? 0;

  return (
    <AnalyzeUrlClient
      diagnosesUsed={diagnosesUsed}
      diagnosesLimit={diagnosesLimit}
      plan={plan}
    />
  );
}
