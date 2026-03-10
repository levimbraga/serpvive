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

  // Step 6: Update primary keyword for each page (recalculated every run)
  // Fallback chain: clicks → impressions → title → URL path
  console.log("[engine] Updating primary keywords...");
  const { data: pages } = await admin
    .from("pages")
    .select("id, title, path")
    .eq("site_id", siteId);

  type KeywordInfo = { keyword: string; position: number | null; source: "clicks" | "impressions" | "title" | "url" };
  const primaryKeywords = new Map<string, KeywordInfo>();

  if (pages) {
    for (const page of pages) {
      // 1. Top query by clicks
      const { data: byClicks } = await admin
        .from("page_queries")
        .select("query, position")
        .eq("page_id", page.id)
        .gt("clicks", 0)
        .order("clicks", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (byClicks) {
        primaryKeywords.set(page.id, { keyword: byClicks.query, position: byClicks.position, source: "clicks" });
        continue;
      }

      // 2. Top query by impressions
      const { data: byImpressions } = await admin
        .from("page_queries")
        .select("query, position")
        .eq("page_id", page.id)
        .gt("impressions", 0)
        .order("impressions", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (byImpressions) {
        primaryKeywords.set(page.id, { keyword: byImpressions.query, position: byImpressions.position, source: "impressions" });
        continue;
      }

      // 3. Extract from page title
      if (page.title) {
        const cleaned = extractKeywordFromTitle(page.title);
        if (cleaned) {
          primaryKeywords.set(page.id, { keyword: cleaned, position: null, source: "title" });
          continue;
        }
      }

      // 4. Extract from URL path
      const fromPath = extractKeywordFromPath(page.path);
      if (fromPath) {
        primaryKeywords.set(page.id, { keyword: fromPath, position: null, source: "url" });
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
        keyword_source: pk?.source ?? null,
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

/** Clean a page title into a usable keyword. */
function extractKeywordFromTitle(title: string): string | null {
  let cleaned = title
    .replace(/\s*[|–—-]\s*[^|–—-]*$/, "")  // Remove "| Site Name", "— Blog", etc.
    .replace(/\s*\([^)]*\)\s*$/, "")          // Remove trailing "(anything)"
    .trim()
    .toLowerCase();

  // Too short or just a domain/brand name
  if (cleaned.length < 5 || cleaned.split(/\s+/).length < 2) return null;
  return cleaned;
}

/** Extract a keyword phrase from a URL path. */
function extractKeywordFromPath(path: string): string | null {
  const segment = path.split("/").filter(Boolean).pop();
  if (!segment) return null;

  const cleaned = segment
    .replace(/\.\w+$/, "")          // Remove file extension
    .replace(/[-_]/g, " ")          // Dashes/underscores → spaces
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  if (cleaned.length < 5 || cleaned.split(/\s+/).length < 2) return null;
  return cleaned;
}
