import type { SupabaseClient } from "@supabase/supabase-js";

type PageDecayResult = {
  pageId: string;
  peakClicksMonthly: number;
  peakMonth: string | null;
  currentClicks28d: number;
  currentImpressions28d: number;
  currentCtr: number;
  currentAvgPosition: number;
  decayScore: number;
};

/**
 * Calculates decay score for all pages of a site.
 * decay_score = (peak_clicks - current_clicks) / peak_clicks × 100
 * - Peak = MAX monthly clicks over the last 16 months
 * - Current = SUM clicks in last 28 days
 * - If peak < 10, score = 0 (noise filter)
 * - If current > peak, score = 0 (page is growing)
 */
export async function calculateDecayScores(
  admin: SupabaseClient,
  siteId: string,
): Promise<PageDecayResult[]> {
  // Get all pages for this site
  const { data: pages, error: pagesErr } = await admin
    .from("pages")
    .select("id")
    .eq("site_id", siteId);

  if (pagesErr || !pages) throw new Error(`Failed to fetch pages: ${pagesErr?.message}`);

  const now = new Date();
  const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const sixteenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 16, 1)
    .toISOString()
    .slice(0, 10);

  const results: PageDecayResult[] = [];

  for (const page of pages) {
    // Get last 28 days metrics
    const { data: recentMetrics } = await admin
      .from("page_metrics_daily")
      .select("clicks, impressions, ctr, avg_position")
      .eq("page_id", page.id)
      .gte("date", twentyEightDaysAgo);

    const currentClicks28d = (recentMetrics ?? []).reduce((sum, m) => sum + m.clicks, 0);
    const currentImpressions28d = (recentMetrics ?? []).reduce((sum, m) => sum + m.impressions, 0);
    const avgCtr = recentMetrics?.length
      ? (recentMetrics.reduce((sum, m) => sum + m.ctr, 0) / recentMetrics.length)
      : 0;
    const avgPosition = recentMetrics?.length
      ? (recentMetrics.reduce((sum, m) => sum + m.avg_position, 0) / recentMetrics.length)
      : 0;

    // Get monthly aggregates for peak calculation
    const { data: allMetrics } = await admin
      .from("page_metrics_daily")
      .select("date, clicks")
      .eq("page_id", page.id)
      .gte("date", sixteenMonthsAgo);

    // Group by month and find peak
    const monthlyClicks = new Map<string, number>();
    for (const m of allMetrics ?? []) {
      const month = m.date.slice(0, 7); // YYYY-MM
      monthlyClicks.set(month, (monthlyClicks.get(month) ?? 0) + m.clicks);
    }

    let peakClicks = 0;
    let peakMonth: string | null = null;
    for (const [month, clicks] of monthlyClicks) {
      if (clicks > peakClicks) {
        peakClicks = clicks;
        peakMonth = month;
      }
    }

    // Calculate decay score
    let decayScore = 0;
    if (peakClicks >= 10 && currentClicks28d < peakClicks) {
      decayScore = Math.round(((peakClicks - currentClicks28d) / peakClicks) * 10000) / 100;
    }

    results.push({
      pageId: page.id,
      peakClicksMonthly: peakClicks,
      peakMonth,
      currentClicks28d,
      currentImpressions28d,
      currentCtr: Math.round(avgCtr * 10000) / 10000,
      currentAvgPosition: Math.round(avgPosition * 100) / 100,
      decayScore: Math.min(decayScore, 100),
    });
  }

  return results;
}
