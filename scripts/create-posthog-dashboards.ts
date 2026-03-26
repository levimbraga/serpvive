/**
 * Creates all 5 PostHog dashboards with insights.
 *
 * Usage:
 *   1. Go to PostHog → Settings → Personal API Keys → Create
 *   2. Run: POSTHOG_PERSONAL_API_KEY=phx_xxx npx tsx scripts/create-posthog-dashboards.ts
 *
 * Safe to re-run — creates new dashboards each time (won't duplicate insights on existing ones).
 */

const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const HOST = "https://us.i.posthog.com";

if (!API_KEY) {
  console.error("Missing POSTHOG_PERSONAL_API_KEY. Get one from PostHog → Settings → Personal API Keys.");
  process.exit(1);
}

// ── API helpers ──

async function getProjectId(): Promise<number> {
  const res = await fetch(`${HOST}/api/projects/`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) throw new Error(`Failed to list projects: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const project = data.results?.[0];
  if (!project) throw new Error("No PostHog projects found");
  console.log(`Using project: ${project.name} (ID: ${project.id})`);
  return project.id;
}

async function createDashboard(projectId: number, name: string, description: string): Promise<number> {
  const res = await fetch(`${HOST}/api/projects/${projectId}/dashboards/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error(`Failed to create dashboard "${name}": ${res.status} ${await res.text()}`);
  const data = await res.json();
  console.log(`  ✓ Dashboard: ${name} (ID: ${data.id})`);
  return data.id;
}

type InsightFilter = Record<string, unknown>;

async function createInsight(projectId: number, dashboardId: number, name: string, filters: InsightFilter): Promise<void> {
  const res = await fetch(`${HOST}/api/projects/${projectId}/insights/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, filters, dashboards: [dashboardId] }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`    ✗ Insight "${name}": ${res.status} ${text.slice(0, 200)}`);
    return;
  }
  console.log(`    ✓ ${name}`);
}

// ── Event/property helpers ──

function evt(id: string, props?: Record<string, unknown>) {
  const e: Record<string, unknown> = { id, type: "events", order: 0 };
  if (props) Object.assign(e, props);
  return e;
}

function breakdown(key: string, type = "event") {
  return { breakdown: key, breakdown_type: type };
}

function propFilter(key: string, value: string, operator = "exact") {
  return { properties: [{ key, value, operator, type: "event" }] };
}

function mathAvg(prop: string) {
  return { math: "avg", math_property: prop };
}

// ── Dashboard 1: Activation Funnel ──

async function createActivationFunnel(pid: number) {
  const did = await createDashboard(pid, "Activation Funnel", "Signup to AHA moment — the most critical metric");

  await createInsight(pid, did, "Main Activation Funnel", {
    insight: "FUNNELS",
    funnel_viz_type: "steps",
    funnel_window_days: 7,
    events: [
      { id: "user_signed_up", order: 0, type: "events" },
      { id: "onboarding_step_completed", order: 1, type: "events", properties: [{ key: "step", value: "gsc_connect", operator: "exact", type: "event" }] },
      { id: "site_imported", order: 2, type: "events" },
      { id: "first_diagnosis_viewed", order: 3, type: "events" },
    ],
    date_from: "-30d",
  });

  await createInsight(pid, did, "Onboarding Steps Over Time", {
    insight: "TRENDS",
    events: [
      evt("user_signed_up", { name: "Signup" }),
      evt("onboarding_step_completed", { name: "GSC Connect", ...propFilter("step", "gsc_connect") }),
      evt("site_imported", { name: "Site Imported" }),
      evt("first_diagnosis_viewed", { name: "First Diagnosis" }),
    ],
    date_from: "-30d",
    display: "ActionsLineGraph",
  });

  await createInsight(pid, did, "Signups by Referral Source", {
    insight: "TRENDS",
    events: [evt("user_signed_up")],
    ...breakdown("$initial_referring_domain", "person"),
    date_from: "-90d",
    display: "ActionsPie",
  });

  return did;
}

// ── Dashboard 2: Infrastructure Health ──

async function createInfraHealth(pid: number) {
  const did = await createDashboard(pid, "Infrastructure Health", "Firecrawl, AI models, performance — are our systems healthy?");

  await createInsight(pid, did, "Firecrawl vs Cheerio (User Page)", {
    insight: "TRENDS",
    events: [evt("diagnosis_completed")],
    ...breakdown("user_page_method"),
    date_from: "-30d",
    display: "ActionsLineGraph",
  });

  await createInsight(pid, did, "Firecrawl Success Rate (avg)", {
    insight: "TRENDS",
    events: [evt("diagnosis_completed", mathAvg("firecrawl_rate"))],
    date_from: "-30d",
    display: "ActionsLineGraph",
  });

  await createInsight(pid, did, "AI Model — Diagnosis", {
    insight: "TRENDS",
    events: [evt("diagnosis_completed")],
    ...breakdown("diagnosis_model"),
    date_from: "-30d",
    display: "ActionsAreaGraph",
  });

  await createInsight(pid, did, "AI Model — Brief", {
    insight: "TRENDS",
    events: [evt("diagnosis_completed")],
    ...breakdown("brief_model"),
    date_from: "-30d",
    display: "ActionsAreaGraph",
  });

  await createInsight(pid, did, "Avg Duration by Phase (ms)", {
    insight: "TRENDS",
    events: [
      evt("diagnosis_completed", { ...mathAvg("fetch_duration_ms"), name: "Fetch" }),
      evt("diagnosis_completed", { ...mathAvg("diagnosis_duration_ms"), name: "Diagnosis" }),
      evt("diagnosis_completed", { ...mathAvg("brief_duration_ms"), name: "Brief" }),
      evt("diagnosis_completed", { ...mathAvg("total_duration_ms"), name: "Total" }),
    ],
    date_from: "-30d",
    display: "ActionsLineGraph",
  });

  await createInsight(pid, did, "Diagnosis Failures", {
    insight: "TRENDS",
    events: [evt("diagnosis_failed")],
    date_from: "-30d",
    display: "ActionsBar",
  });

  await createInsight(pid, did, "Demo vs Logged-in Duration", {
    insight: "TRENDS",
    events: [evt("diagnosis_completed", mathAvg("total_duration_ms"))],
    ...breakdown("is_demo"),
    date_from: "-30d",
    display: "ActionsLineGraph",
  });

  return did;
}

// ── Dashboard 3: Revenue & Billing ──

async function createRevenue(pid: number) {
  const did = await createDashboard(pid, "Revenue & Billing", "MRR, conversions, churn, payment health");

  await createInsight(pid, did, "Plan Upgrades Over Time", {
    insight: "TRENDS",
    events: [evt("plan_upgraded")],
    ...breakdown("plan"),
    date_from: "-90d",
    display: "ActionsBar",
  });

  await createInsight(pid, did, "Plan Changes Over Time", {
    insight: "TRENDS",
    events: [evt("plan_changed")],
    ...breakdown("plan"),
    date_from: "-90d",
    display: "ActionsBar",
  });

  await createInsight(pid, did, "Cancellations Over Time", {
    insight: "TRENDS",
    events: [evt("plan_canceled")],
    date_from: "-90d",
    display: "ActionsBar",
  });

  await createInsight(pid, did, "Cancel Scheduled Over Time", {
    insight: "TRENDS",
    events: [evt("plan_cancel_scheduled")],
    ...breakdown("plan"),
    date_from: "-90d",
    display: "ActionsBar",
  });

  await createInsight(pid, did, "Payment Failures", {
    insight: "TRENDS",
    events: [evt("payment_failed")],
    ...breakdown("failure_reason"),
    date_from: "-90d",
    display: "ActionsBar",
  });

  await createInsight(pid, did, "Upgrades vs Cancels", {
    insight: "TRENDS",
    events: [
      evt("plan_upgraded", { name: "Upgrades" }),
      evt("plan_canceled", { name: "Cancels" }),
    ],
    date_from: "-90d",
    display: "ActionsBar",
  });

  return did;
}

// ── Dashboard 4: Engagement ──

async function createEngagement(pid: number) {
  const did = await createDashboard(pid, "Engagement", "How users interact with the product after activation");

  await createInsight(pid, did, "Diagnoses Per Day", {
    insight: "TRENDS",
    events: [evt("diagnosis_completed")],
    ...breakdown("is_demo"),
    date_from: "-30d",
    display: "ActionsBar",
  });

  await createInsight(pid, did, "Avg Causes Found", {
    insight: "TRENDS",
    events: [evt("diagnosis_completed", mathAvg("causes_count"))],
    date_from: "-30d",
    display: "ActionsLineGraph",
  });

  await createInsight(pid, did, "Avg Topic Coverage %", {
    insight: "TRENDS",
    events: [evt("diagnosis_completed", mathAvg("topic_coverage_percent"))],
    date_from: "-30d",
    display: "ActionsLineGraph",
  });

  await createInsight(pid, did, "Diagnosis → Refresh Funnel", {
    insight: "FUNNELS",
    funnel_viz_type: "steps",
    funnel_window_days: 30,
    events: [
      { id: "viewed_diagnosis", order: 0, type: "events" },
      { id: "refresh_marked", order: 1, type: "events" },
    ],
    date_from: "-30d",
  });

  await createInsight(pid, did, "Feature Usage", {
    insight: "TRENDS",
    events: [
      evt("diagnosis_run", { name: "Manual Diagnosis" }),
      evt("external_analysis_completed", { name: "Analyze URL" }),
      evt("refresh_marked", { name: "Refresh Marked" }),
      evt("page_merged", { name: "Page Merged" }),
    ],
    date_from: "-30d",
    display: "ActionsBar",
  });

  await createInsight(pid, did, "Diagnoses Viewed", {
    insight: "TRENDS",
    events: [evt("viewed_diagnosis")],
    date_from: "-30d",
    display: "ActionsLineGraph",
  });

  await createInsight(pid, did, "Upgrade Clicks", {
    insight: "TRENDS",
    events: [evt("upgrade_clicked")],
    ...breakdown("from"),
    date_from: "-30d",
    display: "ActionsBar",
  });

  return did;
}

// ── Dashboard 5: Acquisition ──

async function createAcquisition(pid: number) {
  const did = await createDashboard(pid, "Acquisition", "Where users come from and what converts them");

  await createInsight(pid, did, "Signups Over Time", {
    insight: "TRENDS",
    events: [evt("user_signed_up")],
    date_from: "-90d",
    display: "ActionsBar",
  });

  await createInsight(pid, did, "Signups by Method", {
    insight: "TRENDS",
    events: [evt("user_signed_up")],
    ...breakdown("method"),
    date_from: "-90d",
    display: "ActionsPie",
  });

  await createInsight(pid, did, "CTA Clicks by Location", {
    insight: "TRENDS",
    events: [evt("cta_clicked")],
    ...breakdown("location"),
    date_from: "-30d",
    display: "ActionsBar",
  });

  await createInsight(pid, did, "Decay Calculator Usage", {
    insight: "TRENDS",
    events: [evt("decay_calculator_used")],
    date_from: "-30d",
    display: "ActionsLineGraph",
  });

  await createInsight(pid, did, "Referral Source → Signup", {
    insight: "TRENDS",
    events: [evt("signup_referral_source")],
    ...breakdown("source"),
    date_from: "-90d",
    display: "ActionsPie",
  });

  await createInsight(pid, did, "Logins Over Time", {
    insight: "TRENDS",
    events: [evt("user_logged_in")],
    ...breakdown("method"),
    date_from: "-30d",
    display: "ActionsBar",
  });

  return did;
}

// ── Main ──

async function main() {
  console.log("Creating PostHog dashboards...\n");

  const pid = await getProjectId();
  console.log("");

  const d1 = await createActivationFunnel(pid);
  console.log("");
  const d2 = await createInfraHealth(pid);
  console.log("");
  const d3 = await createRevenue(pid);
  console.log("");
  const d4 = await createEngagement(pid);
  console.log("");
  const d5 = await createAcquisition(pid);

  console.log("\n========================================");
  console.log("POSTHOG DASHBOARDS CREATED");
  console.log("========================================");
  console.log(`1. Activation Funnel      → ${HOST}/dashboard/${d1}`);
  console.log(`2. Infrastructure Health  → ${HOST}/dashboard/${d2}`);
  console.log(`3. Revenue & Billing      → ${HOST}/dashboard/${d3}`);
  console.log(`4. Engagement             → ${HOST}/dashboard/${d4}`);
  console.log(`5. Acquisition            → ${HOST}/dashboard/${d5}`);
  console.log("========================================");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
