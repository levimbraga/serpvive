import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateDecayScores } from "./decay-scorer";
import { calculateVelocity } from "./velocity";
import { detectSeasonal } from "./seasonal";
import { classifyPages } from "./classifier";
import { calculateHealthScore } from "./health-score";

type EngineResult = {
  siteId: string;
  healthScore: number;
  healthScorePrev: number | null;
  pagesCount: number;
  pagesHealthy: number;
  pagesWarning: number;
  pagesCritical: number;
  pagesDead: number;
  pagesProcessed: number;
};

/**
 * Runs the full decay engine for a site:
 * 1. Calculate decay scores
 * 2. Calculate velocity (7d + 28d)
 * 3. Detect seasonal patterns
 * 4. Classify pages
 * 5. Calculate health score
 * 6. Update primary keyword per page
 * 7. Persist everything to DB
 */
export async function runEngine(
  admin: SupabaseClient,
  siteId: string,
): Promise<EngineResult> {
  console.log(`[engine] Starting for site ${siteId}`);

  // Get previous health score before recalculating
  const { data: siteData } = await admin
    .from("sites")
    .select("health_score")
    .eq("id", siteId)
    .single();

  const healthScorePrev = siteData?.health_score ?? null;

  // Step 1: Decay scores
  console.log("[engine] Calculating decay scores...");
  const decayResults = await calculateDecayScores(admin, siteId);

  // Step 2: Velocity
  console.log("[engine] Calculating velocity...");
  const velocityResults = await calculateVelocity(admin, siteId);

  // Step 3: Seasonal detection
  console.log("[engine] Detecting seasonal patterns...");
  const seasonalResults = await detectSeasonal(admin, siteId);

  // Step 4: Classify
  const decayMap = new Map(decayResults.map((r) => [r.pageId, r.decayScore]));
  console.log("[engine] Classifying pages...");
  const classifierResults = await classifyPages(admin, siteId, decayMap);

  // Step 5: Health score
  const statusMap = new Map(classifierResults.map((r) => [r.pageId, r.status]));
  const healthScore = calculateHealthScore(statusMap);

  // Step 6: Update primary keyword for each page
  console.log("[engine] Updating primary keywords...");
  const { data: pages } = await admin
    .from("pages")
    .select("id")
    .eq("site_id", siteId);

  const primaryKeywords = new Map<string, { keyword: string; position: number }>();

  if (pages) {
    for (const page of pages) {
      const { data: topQuery } = await admin
        .from("page_queries")
        .select("query, position")
        .eq("page_id", page.id)
        .order("clicks", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (topQuery) {
        primaryKeywords.set(page.id, {
          keyword: topQuery.query,
          position: topQuery.position,
        });
      }
    }
  }

  // Build lookup maps
  const velocityMap = new Map(velocityResults.map((r) => [r.pageId, r]));
  const seasonalMap = new Map(seasonalResults.map((r) => [r.pageId, r.isSeasonal]));

  // Step 7: Persist to DB — update each page
  console.log("[engine] Persisting results...");
  let pagesProcessed = 0;

  for (const decay of decayResults) {
    const velocity = velocityMap.get(decay.pageId);
    const isSeasonal = seasonalMap.get(decay.pageId) ?? false;
    const status = statusMap.get(decay.pageId) ?? "unknown";
    const pk = primaryKeywords.get(decay.pageId);

    const { error } = await admin
      .from("pages")
      .update({
        current_clicks_28d: decay.currentClicks28d,
        current_impressions_28d: decay.currentImpressions28d,
        current_ctr: decay.currentCtr,
        current_avg_position: decay.currentAvgPosition,
        peak_clicks_monthly: decay.peakClicksMonthly,
        peak_month: decay.peakMonth ? `${decay.peakMonth}-01` : null,
        decay_score: decay.decayScore,
        decay_velocity_7d: velocity?.velocity7d ?? 0,
        decay_velocity_28d: velocity?.velocity28d ?? 0,
        is_seasonal: isSeasonal,
        status,
        primary_keyword: pk?.keyword ?? null,
        primary_position: pk?.position ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", decay.pageId);

    if (!error) pagesProcessed++;
  }

  // Count statuses
  let pagesHealthy = 0, pagesWarning = 0, pagesCritical = 0, pagesDead = 0;
  for (const status of statusMap.values()) {
    if (status === "healthy") pagesHealthy++;
    else if (status === "warning") pagesWarning++;
    else if (status === "critical") pagesCritical++;
    else if (status === "dead") pagesDead++;
  }

  // Update site
  await admin
    .from("sites")
    .update({
      health_score: healthScore,
      health_score_prev: healthScorePrev,
      pages_count: decayResults.length,
      pages_healthy: pagesHealthy,
      pages_warning: pagesWarning,
      pages_critical: pagesCritical,
      pages_dead: pagesDead,
      last_engine_run_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", siteId);

  console.log(`[engine] Done. Health: ${healthScore}, Pages: ${pagesProcessed}/${decayResults.length}`);

  return {
    siteId,
    healthScore,
    healthScorePrev,
    pagesCount: decayResults.length,
    pagesHealthy,
    pagesWarning,
    pagesCritical,
    pagesDead,
    pagesProcessed,
  };
}
