import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { type PlanName, isAdmin } from "@/lib/constants";
import { getUsage } from "@/lib/limits";
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

  // Free plan: the shared lifetime pool — the same allowance GSC diagnoses draw
  // from (mirrors the check in /api/analyze-url).
  const { used: diagnosesUsed, limit: diagnosesLimit } = await getUsage(
    supabase,
    user.id,
    plan,
    profile?.diagnoses_used_this_month ?? 0,
  );

  return (
    <AnalyzeUrlClient
      diagnosesUsed={diagnosesUsed}
      diagnosesLimit={diagnosesLimit}
      plan={plan}
    />
  );
}
