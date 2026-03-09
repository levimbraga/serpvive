import type { SupabaseClient } from "@supabase/supabase-js";
import { DECAY_THRESHOLDS } from "@/lib/constants";

type SeasonalResult = {
  pageId: string;
  isSeasonal: boolean;
};

/**
 * Detects seasonal pages by comparing current period vs same period last year.
 * If the ratio is between 0.80 and 1.20 (within ±20%), mark as seasonal.
 * This filters false positives — pages that naturally dip at certain times of year.
 */
export async function detectSeasonal(
  admin: SupabaseClient,
  siteId: string,
): Promise<SeasonalResult[]> {
  const { data: pages } = await admin
    .from("pages")
    .select("id")
    .eq("site_id", siteId);

  if (!pages) return [];

  const now = new Date();
  const tolerance = DECAY_THRESHOLDS.seasonal_tolerance / 100; // 0.20

  // Current 28-day window
  const currentStart = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Same window last year
  const lastYearNow = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const lastYearStart = new Date(lastYearNow.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const lastYearEnd = lastYearNow.toISOString().slice(0, 10);

  const results: SeasonalResult[] = [];

  for (const page of pages) {
    const { data: currentMetrics } = await admin
      .from("page_metrics_daily")
      .select("clicks")
      .eq("page_id", page.id)
      .gte("date", currentStart);

    const { data: lastYearMetrics } = await admin
      .from("page_metrics_daily")
      .select("clicks")
      .eq("page_id", page.id)
      .gte("date", lastYearStart)
      .lte("date", lastYearEnd);

    const currentClicks = (currentMetrics ?? []).reduce((s, m) => s + m.clicks, 0);
    const lastYearClicks = (lastYearMetrics ?? []).reduce((s, m) => s + m.clicks, 0);

    let isSeasonal = false;
    if (lastYearClicks > 0 && currentClicks > 0) {
      const ratio = currentClicks / lastYearClicks;
      isSeasonal = ratio >= (1 - tolerance) && ratio <= (1 + tolerance);
    }

    results.push({ pageId: page.id, isSeasonal });
  }

  return results;
}
