export const PLAN_LIMITS = {
  free:    { sites: 1, pages: 100, diagnoses_per_month: 0 },
  starter: { sites: 1, pages: 100, diagnoses_per_month: 10 },
  pro:     { sites: 3, pages: 1000, diagnoses_per_month: 40 },
  agency:  { sites: 10, pages: 5000, diagnoses_per_month: 120 },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

/** Max AI diagnoses per hour per plan (rate limit, not monthly quota). */
export const RATE_LIMITS_PER_HOUR: Record<PlanName, number> = {
  free: 1,
  starter: 5,
  pro: 10,
  agency: 20,
};

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
