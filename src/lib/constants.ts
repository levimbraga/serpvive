export const PLAN_LIMITS = {
  trial:   { sites: 1, pages: 100, diagnoses_per_month: 3,   team_members: 1 },
  starter: { sites: 1, pages: 100, diagnoses_per_month: 10,  team_members: 1 },
  pro:     { sites: 3, pages: 500, diagnoses_per_month: 40,  team_members: 3 },
  agency:  { sites: 10, pages: 2000, diagnoses_per_month: 120, team_members: 10 },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

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
