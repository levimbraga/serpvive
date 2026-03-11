import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import PageDetailClient from "@/components/pages/PageDetailClient";

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
    .select("user_id, domain")
    .eq("id", page.site_id)
    .single();

  if (!site || site.user_id !== user.id) notFound();

  // Fetch latest diagnosis + latest refresh + profile in parallel
  const [diagnosisRes, refreshRes, profileRes] = await Promise.all([
    supabase
      .from("diagnoses")
      .select("id, diagnosis, refresh_brief, cost_usd, processing_time_ms, created_at")
      .eq("page_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("refreshes")
      .select("id, refreshed_at, result_status, actions_completed, before_clicks_28d, before_impressions_28d, before_ctr, before_avg_position, after_clicks_28d, after_impressions_28d, after_ctr, after_avg_position, clicks_delta, clicks_delta_pct, result_calculated_at")
      .eq("page_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("plan, diagnoses_used_this_month")
      .eq("id", user.id)
      .single(),
  ]);

  return (
    <PageDetailClient
      page={page}
      siteDomain={site.domain}
      latestDiagnosis={diagnosisRes.data}
      latestRefresh={refreshRes.data}
      plan={(profileRes.data?.plan ?? "free") as string}
      diagnosesUsed={profileRes.data?.diagnoses_used_this_month ?? 0}
      diagnosesLimit={
        ({ free: 0, starter: 10, pro: 40, agency: 120 } as Record<string, number>)[profileRes.data?.plan ?? "free"] ?? 0
      }
      userEmail={user.email ?? ""}
    />
  );
}
