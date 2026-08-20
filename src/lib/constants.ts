export const PLAN_LIMITS = {
  free:    { sites: 1, pages: 100, diagnoses_per_month: 0 },
  starter: { sites: 1, pages: 100, diagnoses_per_month: 10 },
  pro:     { sites: 3, pages: 1000, diagnoses_per_month: 40 },
  agency:  { sites: 10, pages: 5000, diagnoses_per_month: 120 },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

/**
 * Public-version free-tier caps. Lifetime per account, not monthly — counted
 * from table rows (diagnoses / external_analyses), never from a counter column.
 *
 * The two numbers differ on purpose. A GSC diagnosis requires connecting
 * Google Search Console and owning a site with real history: a high barrier
 * that is self-limiting, so it can afford to be generous. A standalone URL
 * analysis requires proving nothing at all, which makes it the cheap abuse
 * vector — so it stays tighter despite costing the same per run.
 */
export const FREE_LIFETIME_DIAGNOSES = 10;
export const FREE_LIFETIME_URL_ANALYSES = 3;

/** Max AI diagnoses per hour per plan (rate limit, not monthly quota). */
export const RATE_LIMITS_PER_HOUR: Record<PlanName, number> = {
  free: 1,
  starter: 5,
  pro: 10,
  agency: 20,
};

/**
 * Check if a given email is the admin. Safe to call with undefined/null.
 * Deny-by-default: if ADMIN_EMAIL is unset, nobody is admin — a guard that
 * works without configuration is a guard that gets forgotten.
 */
export function isAdmin(email: string | undefined | null): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  return !!adminEmail && !!email && email === adminEmail;
}

export const DECAY_THRESHOLDS = {
  healthy_max: 15,
  warning_max: 30,
  critical_min: 30,
  dead_min: 70,
  velocity_low: 5,
  velocity_high: 15,
  seasonal_tolerance: 20,
  new_page_months: 3,
} as const;
