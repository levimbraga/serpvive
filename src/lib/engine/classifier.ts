import type { SupabaseClient } from "@supabase/supabase-js";
import { DECAY_THRESHOLDS } from "@/lib/constants";

type PageStatus = "healthy" | "warning" | "critical" | "dead" | "new" | "unknown" | "redirected";

type ClassifierResult = {
  pageId: string;
  status: PageStatus;
};

/**
 * Classifies pages by decay status. Rules applied in order:
 * 1. Data < 3 months old → "new"
 * 2. decay_score > 70% for 6+ months → "dead"
 * 3. decay_score > 30% → "critical"
 * 4. decay_score 15–30% → "warning"
 * 5. decay_score < 15% → "healthy"
 */
export async function classifyPages(
  admin: SupabaseClient,
  siteId: string,
  decayScores: Map<string, number>,
): Promise<ClassifierResult[]> {
  const { data: pages } = await admin
    .from("pages")
    .select("id, created_at")
    .eq("site_id", siteId)
    .neq("status", "redirected");

  if (!pages) return [];

  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - DECAY_THRESHOLDS.new_page_months, now.getDate());
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

  const results: ClassifierResult[] = [];

  for (const page of pages) {
    const createdAt = new Date(page.created_at);
    const decayScore = decayScores.get(page.id) ?? 0;

    let status: PageStatus;

    // Rule 1: New page
    if (createdAt > threeMonthsAgo) {
      status = "new";
    }
    // Rule 2: Dead — high decay sustained over 6 months
    else if (decayScore >= DECAY_THRESHOLDS.dead_min && createdAt < sixMonthsAgo) {
      status = "dead";
    }
    // Rule 3: Critical
    else if (decayScore >= DECAY_THRESHOLDS.critical_min) {
      status = "critical";
    }
    // Rule 4: Warning
    else if (decayScore >= DECAY_THRESHOLDS.healthy_max) {
      status = "warning";
    }
    // Rule 5: Healthy
    else {
      status = "healthy";
    }

    results.push({ pageId: page.id, status });
  }

  return results;
}
