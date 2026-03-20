import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateHealthScore } from "./health-score";

/**
 * Recalculates page status counts and health score for a site.
 * Used after exclude/restore operations to keep site stats accurate
 * without running the full engine.
 */
export async function recalcSiteCounts(
  admin: SupabaseClient,
  siteId: string,
): Promise<void> {
  const { data: pages } = await admin
    .from("pages")
    .select("status")
    .eq("site_id", siteId)
    .neq("status", "redirected")
    .neq("status", "excluded");

  if (!pages) return;

  let pagesHealthy = 0, pagesWarning = 0, pagesCritical = 0, pagesDead = 0;
  type PageStatus = "healthy" | "warning" | "critical" | "dead" | "new" | "unknown" | "redirected" | "excluded";
  const statusMap = new Map<string, PageStatus>();

  for (const p of pages) {
    const s = p.status as string;
    statusMap.set(Math.random().toString(), s as PageStatus);
    if (s === "healthy") pagesHealthy++;
    else if (s === "warning") pagesWarning++;
    else if (s === "critical") pagesCritical++;
    else if (s === "dead") pagesDead++;
  }

  const healthScore = calculateHealthScore(statusMap);

  await admin
    .from("sites")
    .update({
      pages_count: pages.length,
      pages_healthy: pagesHealthy,
      pages_warning: pagesWarning,
      pages_critical: pagesCritical,
      pages_dead: pagesDead,
      health_score: healthScore,
      updated_at: new Date().toISOString(),
    })
    .eq("id", siteId);
}
