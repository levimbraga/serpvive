export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: "free" | "starter" | "pro" | "agency";
  plan_status: "active" | "canceled" | "past_due";
  trial_ends_at: string | null; // deprecated, kept for DB compat
  diagnoses_used_this_month: number;
  diagnoses_reset_at: string;
  digest_day: string;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type Site = {
  id: string;
  user_id: string;
  domain: string;
  gsc_property: string;
  gsc_refresh_token: string;
  gsc_access_token: string | null;
  gsc_token_expires_at: string | null;
  status: "importing" | "active" | "paused" | "error";
  health_score: number | null;
  health_score_prev: number | null;
  pages_count: number;
  pages_healthy: number;
  pages_warning: number;
  pages_critical: number;
  pages_dead: number;
  last_sync_at: string | null;
  last_engine_run_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Page = {
  id: string;
  site_id: string;
  url: string;
  path: string;
  title: string | null;
  current_clicks_28d: number;
  current_impressions_28d: number;
  current_ctr: number;
  current_avg_position: number;
  peak_clicks_monthly: number;
  peak_month: string | null;
  decay_score: number;
  decay_velocity_7d: number;
  decay_velocity_28d: number;
  is_seasonal: boolean;
  status: "healthy" | "warning" | "critical" | "dead" | "new" | "unknown";
  primary_keyword: string | null;
  primary_position: number | null;
  last_diagnosis_at: string | null;
  last_refresh_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PageMetric = {
  id: number;
  page_id: string;
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avg_position: number;
  created_at: string;
};

export type PageQuery = {
  id: number;
  page_id: string;
  query: string;
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  created_at: string;
};

export type Diagnosis = {
  id: string;
  page_id: string;
  user_id: string;
  diagnosis: Record<string, unknown>;
  refresh_brief: Record<string, unknown> | null;
  serp_snapshot: Record<string, unknown> | null;
  model_used: string;
  tokens_input: number | null;
  tokens_output: number | null;
  cost_usd: number | null;
  processing_time_ms: number | null;
  triggered_by: "auto" | "manual" | "batch";
  created_at: string;
};

export type Refresh = {
  id: string;
  page_id: string;
  diagnosis_id: string | null;
  user_id: string;
  refreshed_at: string;
  actions_completed: unknown[];
  notes: string | null;
  before_clicks_28d: number | null;
  before_impressions_28d: number | null;
  before_ctr: number | null;
  before_avg_position: number | null;
  after_clicks_28d: number | null;
  after_impressions_28d: number | null;
  after_ctr: number | null;
  after_avg_position: number | null;
  result_status:
    | "pending"
    | "measuring"
    | "success"
    | "partial"
    | "no_change"
    | "declined"
    | null;
  result_calculated_at: string | null;
  clicks_delta: number | null;
  clicks_delta_pct: number | null;
  created_at: string;
};

export type Waitlist = {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
};
