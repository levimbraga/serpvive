import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import PageDetailClient from "@/components/pages/PageDetailClient";
import { isAdmin, type PlanName } from "@/lib/constants";
import { getUsage } from "@/lib/limits";

export const metadata: Metadata = {
  title: "Page Detail — SerpVive",
};

export default async function PageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch page with site verification
  const { data: page } = await supabase
    .from("pages")
    .select("*, site_id")
    .eq("id", id)
    .single();

  if (!page) notFound();

  // Verify ownership
  const { data: site } = await supabase
    .from("sites")
    .select("user_id, domain, has_free_diagnosis, auto_diagnosis_status")
    .eq("id", page.site_id)
    .single();

  if (!site || site.user_id !== user.id) notFound();

  // Fetch all diagnoses (up to 11: 1 current + 10 history) + latest refresh + profile + merge info in parallel
  const [diagnosisRes, refreshRes, profileRes, mergedFromRes, sitePagesRes] = await Promise.all([
    supabase
      .from("diagnoses")
      .select("id, diagnosis, refresh_brief, cost_usd, processing_time_ms, created_at, keyword_used, keyword_source")
      .eq("page_id", id)
      .order("created_at", { ascending: false })
      .limit(11),
    supabase
      .from("refreshes")
      .select("id, refreshed_at, result_status, actions_completed, before_clicks_28d, before_impressions_28d, before_ctr, before_avg_position, after_clicks_28d, after_impressions_28d, after_ctr, after_avg_position, clicks_delta, clicks_delta_pct, result_calculated_at")
      .eq("page_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("plan, diagnoses_used_this_month, timezone")
      .eq("id", user.id)
      .single(),
    page.merged_from
      ? supabase.from("pages").select("id, url, path").eq("id", page.merged_from).single()
      : Promise.resolve({ data: null }),
    supabase
      .from("pages")
      .select("id, path, url, status")
      .eq("site_id", page.site_id)
      .neq("status", "redirected")
      .neq("id", id),
  ]);

  const allDiagnoses = diagnosisRes.data ?? [];
  const latestDiagnosis = allDiagnoses[0] ?? null;
  const previousDiagnoses = allDiagnoses.slice(1, 11); // Up to 10 history items

  // Free plan: shared lifetime pool counted from rows (mirrors /api/diagnose,
  // and includes standalone URL analyses). Paid plans keep the monthly counter.
  const rawPlan = isAdmin(user.email) ? "agency" : ((profileRes.data?.plan ?? "free") as string);
  const { used: diagnosesUsed, limit: diagnosesLimit } = await getUsage(
    supabase,
    user.id,
    rawPlan as PlanName,
    profileRes.data?.diagnoses_used_this_month ?? 0,
  );

  return (
    <PageDetailClient
      page={page}
      siteDomain={site.domain}
      latestDiagnosis={latestDiagnosis}
      previousDiagnoses={previousDiagnoses}
      latestRefresh={refreshRes.data}
      plan={rawPlan}
      diagnosesUsed={diagnosesUsed}
      diagnosesLimit={diagnosesLimit}
      timeZone={profileRes.data?.timezone ?? "UTC"}
      isAdmin={isAdmin(user.email)}
      autoDiagStatus={(site as { auto_diagnosis_status?: string }).auto_diagnosis_status ?? "pending"}
      mergedFrom={mergedFromRes.data ? { ...mergedFromRes.data, mergedAt: page.merged_at ?? "" } : null}
      sitePages={(sitePagesRes.data ?? []).map((p) => ({ id: p.id, path: p.path, url: p.url }))}
    />
  );
}
