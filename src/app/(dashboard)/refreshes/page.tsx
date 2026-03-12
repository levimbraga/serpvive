import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import RefreshesClient from "@/components/refreshes/RefreshesClient";

export const metadata: Metadata = {
  title: "Refresh History — SerpVive",
};

export default async function RefreshesPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: refreshes } = await supabase
    .from("refreshes")
    .select(`
      id,
      page_id,
      diagnosis_id,
      refreshed_at,
      result_status,
      actions_completed,
      before_clicks_28d,
      before_impressions_28d,
      before_ctr,
      before_avg_position,
      after_clicks_28d,
      after_impressions_28d,
      after_ctr,
      after_avg_position,
      clicks_delta,
      clicks_delta_pct,
      result_calculated_at,
      created_at
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch related pages for URL display
  const pageIds = [...new Set((refreshes ?? []).map((r) => r.page_id))];
  const { data: pages } = pageIds.length > 0
    ? await supabase
        .from("pages")
        .select("id, url, path")
        .in("id", pageIds)
    : { data: [] };

  const pageMap = new Map((pages ?? []).map((p) => [p.id, { url: p.url, path: p.path }]));

  const items = (refreshes ?? []).map((r) => ({
    id: r.id,
    pageId: r.page_id,
    diagnosisId: r.diagnosis_id,
    pagePath: pageMap.get(r.page_id)?.path ?? "/unknown",
    pageUrl: pageMap.get(r.page_id)?.url ?? "",
    refreshedAt: r.refreshed_at,
    resultStatus: r.result_status as string,
    actionsCompleted: (r.actions_completed as string[]) ?? [],
    beforeClicks: r.before_clicks_28d as number | null,
    beforeImpressions: r.before_impressions_28d as number | null,
    beforeCtr: r.before_ctr as number | null,
    beforePosition: r.before_avg_position as number | null,
    afterClicks: r.after_clicks_28d as number | null,
    afterImpressions: r.after_impressions_28d as number | null,
    afterCtr: r.after_ctr as number | null,
    afterPosition: r.after_avg_position as number | null,
    clicksDelta: r.clicks_delta as number | null,
    clicksDeltaPct: r.clicks_delta_pct as number | null,
    resultCalculatedAt: r.result_calculated_at as string | null,
  }));

  return <RefreshesClient items={items} />;
}
