// Plan limit checks — the one place that knows how free usage is counted.
import type { SupabaseClient } from "@supabase/supabase-js";
import { PLAN_LIMITS, FREE_LIFETIME_ANALYSES, type PlanName } from "@/lib/constants";

export type Usage = {
  /** Runs already consumed. */
  used: number;
  /** Total allowance: lifetime pool on free, monthly quota on paid. */
  limit: number;
  /** Remaining runs, never negative. */
  remaining: number;
  /** False when the next run must be refused. */
  canAnalyze: boolean;
};

/**
 * Free-plan usage: one shared lifetime pool across GSC diagnoses and standalone
 * URL analyses.
 *
 * Counted from rows in two tables, because the two paths write to two tables:
 * /api/diagnose writes `diagnoses`, /api/analyze-url writes `external_analyses`.
 * A standalone analysis whose URL belongs to a connected GSC site writes to
 * BOTH — those rows carry `external_analyses.page_id`, and are excluded here so
 * one user action costs exactly one credit.
 *
 * Accepts either the request-scoped server client (RLS scopes to the user) or
 * the admin client (API routes); both are given an explicit user_id filter, so
 * the result does not depend on which one was passed.
 */
export async function countFreeAnalysesUsed(
  client: SupabaseClient,
  userId: string,
): Promise<number> {
  const [diagnosesRes, externalRes] = await Promise.all([
    client
      .from("diagnoses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    client
      .from("external_analyses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("page_id", null),
  ]);

  return (diagnosesRes.count ?? 0) + (externalRes.count ?? 0);
}

/**
 * Usage for any plan, as the UI and the API gates should both read it.
 *
 * `monthlyUsed` is the `profiles.diagnoses_used_this_month` counter, which only
 * governs paid plans; free ignores it entirely in favour of the row count.
 */
export async function getUsage(
  client: SupabaseClient,
  userId: string,
  plan: PlanName,
  monthlyUsed: number,
): Promise<Usage> {
  const isFree = plan === "free";
  const limit = isFree ? FREE_LIFETIME_ANALYSES : (PLAN_LIMITS[plan]?.diagnoses_per_month ?? 0);
  const used = isFree ? await countFreeAnalysesUsed(client, userId) : monthlyUsed;

  return {
    used,
    limit,
    remaining: Math.max(limit - used, 0),
    canAnalyze: used < limit,
  };
}
