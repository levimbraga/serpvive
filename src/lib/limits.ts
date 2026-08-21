// Plan limit checks — the one place that knows how free usage is counted.
import type { SupabaseClient } from "@supabase/supabase-js";
import { PLAN_LIMITS, FREE_LIFETIME_ANALYSES, RATE_LIMITS_PER_HOUR, isAdmin, type PlanName } from "@/lib/constants";
import { checkRateLimit } from "@/lib/rate-limit";

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

/** Which endpoint is asking. Selects the rate-limit bucket and the wording. */
export type UsageAction = "diagnose" | "analyze-url";

/**
 * A refusal to hand straight back to the caller, or `null` when the run may
 * proceed. Shaped as the response the route already returned, so centralizing
 * the gate changed no bytes on the wire.
 */
export type UsageRefusal = {
  status: number;
  error: string;
  /**
   * Machine-readable tag. Optional because the two routes never agreed on it:
   * the monthly refusal carries `limit_reached` on /api/analyze-url and nothing
   * on /api/diagnose. Nothing reads these codes today — every client uses
   * `json.error` — so the asymmetry is preserved rather than quietly
   * normalized, which would have made this refactor unverifiable by reading.
   */
  code?: string;
};

/** Per-action wording. The only thing that actually differs between routes. */
const ACTION_COPY: Record<UsageAction, {
  freeCapScope: string;
  canceledNoun: string;
  monthlyNoun: string;
  monthlyCode?: string;
}> = {
  "diagnose": {
    freeCapScope: "shared between Search Console pages and standalone URLs",
    canceledNoun: "AI diagnoses",
    monthlyNoun: "diagnosis",
  },
  "analyze-url": {
    freeCapScope: "shared between standalone URLs and Search Console pages",
    canceledNoun: "AI analyses",
    monthlyNoun: "analysis",
    monthlyCode: "limit_reached",
  },
};

type CheckUsageArgs = {
  userId: string;
  /** Needed for the admin bypass on the canceled-subscription check. */
  email: string | null | undefined;
  /** Already resolved: admin arrives here as "agency". */
  plan: PlanName;
  planStatus: string | null | undefined;
  /** `profiles.diagnoses_used_this_month`; only paid plans read it. */
  monthlyUsed: number;
  action: UsageAction;
};

/**
 * The whole gate in front of an AI run, in one call.
 *
 * Four checks in the order the routes ran them, which is load-bearing: the rate
 * limit is in-memory and free, the free cap is two counting queries, and both
 * come before anything that costs money. A caller that forgets one of these
 * spends real API budget it should have refused.
 *
 *   1. rate limit          — per plan, per hour, per action bucket
 *   2. free lifetime cap   — the shared pool, free plans only
 *   3. canceled subscription — paid plans only, admin bypasses
 *   4. monthly quota       — paid plans only
 *
 * Returns `null` to proceed. Everything else is a refusal to return verbatim.
 */
export async function checkUsage(
  client: SupabaseClient,
  { userId, email, plan, planStatus, monthlyUsed, action }: CheckUsageArgs,
): Promise<UsageRefusal | null> {
  const copy = ACTION_COPY[action];
  const isFree = plan === "free";

  const hourlyLimit = RATE_LIMITS_PER_HOUR[plan] ?? 3;
  if (!checkRateLimit(`${action}:${userId}`, hourlyLimit, 3_600_000)) {
    return {
      status: 429,
      error: "You're analyzing too fast. Please wait a few minutes before running another diagnosis.",
      code: "slow_down",
    };
  }

  // Free plan: one shared lifetime pool, counted from table rows (counter
  // columns can drift; rows don't). A GSC diagnosis and a standalone URL
  // analysis run the same pipeline at the same cost, so they draw from the same
  // allowance. The welcome auto-diagnosis writes a row like any other run, so it
  // counts too. Each run costs real API money, so the public version caps
  // instead of gating behind upgrades — paid plans are not enabled.
  if (isFree) {
    const lifetimeCount = await countFreeAnalysesUsed(client, userId);
    if (lifetimeCount >= FREE_LIFETIME_ANALYSES) {
      return {
        status: 403,
        error: `This public version has a free usage cap (${FREE_LIFETIME_ANALYSES} AI analyses per account, ${copy.freeCapScope}). Paid plans are not enabled.`,
        code: "free_cap_reached",
      };
    }
  }

  // Paid plans only — admin bypasses, since admin arrives as "agency" without
  // ever having had a subscription to cancel.
  if (!isFree && planStatus === "canceled" && !isAdmin(email)) {
    return {
      status: 403,
      error: `Subscription canceled. Resubscribe to use ${copy.canceledNoun}.`,
    };
  }

  // Monthly quota — paid plans only; free is governed by the lifetime cap above.
  if (!isFree) {
    const limit = PLAN_LIMITS[plan]?.diagnoses_per_month ?? 0;
    if (monthlyUsed >= limit) {
      return {
        status: 429,
        error: `Monthly ${copy.monthlyNoun} limit reached (${limit}/${limit}).`,
        ...(copy.monthlyCode ? { code: copy.monthlyCode } : {}),
      };
    }
  }

  return null;
}
