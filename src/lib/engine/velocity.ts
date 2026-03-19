import type { SupabaseClient } from "@supabase/supabase-js";

type VelocityResult = {
  pageId: string;
  velocity7d: number;
  velocity28d: number;
};

/**
 * Calculates decay velocity for all pages of a site.
 * velocity_7d = (clicks_last_week - clicks_this_week) / clicks_last_week × 100
 * velocity_28d = same logic for 28-day windows
 * Positive = declining, Negative = growing
 */
export async function calculateVelocity(
  admin: SupabaseClient,
  siteId: string,
): Promise<VelocityResult[]> {
  const { data: pages } = await admin
    .from("pages")
    .select("id")
    .eq("site_id", siteId)
    .neq("status", "redirected");

  if (!pages) return [];

  const now = new Date();
  const results: VelocityResult[] = [];

  for (const page of pages) {
    // 7-day velocity: compare this week vs last week
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data: thisWeek } = await admin
      .from("page_metrics_daily")
      .select("clicks")
      .eq("page_id", page.id)
      .gte("date", thisWeekStart);

    const { data: lastWeek } = await admin
      .from("page_metrics_daily")
      .select("clicks")
      .eq("page_id", page.id)
      .gte("date", lastWeekStart)
      .lt("date", thisWeekStart);

    const thisWeekClicks = (thisWeek ?? []).reduce((s, m) => s + m.clicks, 0);
    const lastWeekClicks = (lastWeek ?? []).reduce((s, m) => s + m.clicks, 0);

    const velocity7d = lastWeekClicks > 0
      ? Math.round(((lastWeekClicks - thisWeekClicks) / lastWeekClicks) * 10000) / 100
      : 0;

    // 28-day velocity: compare last 28d vs previous 28d
    const period1Start = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const period2Start = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data: period1 } = await admin
      .from("page_metrics_daily")
      .select("clicks")
      .eq("page_id", page.id)
      .gte("date", period1Start);

    const { data: period2 } = await admin
      .from("page_metrics_daily")
      .select("clicks")
      .eq("page_id", page.id)
      .gte("date", period2Start)
      .lt("date", period1Start);

    const period1Clicks = (period1 ?? []).reduce((s, m) => s + m.clicks, 0);
    const period2Clicks = (period2 ?? []).reduce((s, m) => s + m.clicks, 0);

    const velocity28d = period2Clicks > 0
      ? Math.round(((period2Clicks - period1Clicks) / period2Clicks) * 10000) / 100
      : 0;

    results.push({
      pageId: page.id,
      velocity7d,
      velocity28d,
    });
  }

  return results;
}
