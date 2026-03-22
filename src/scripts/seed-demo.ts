/**
 * Seed script: creates a demo site with 20 pages, 12 months of daily metrics,
 * page queries, a pre-made diagnosis (mock), and a completed refresh.
 *
 * Run:  npx tsx src/scripts/seed-demo.ts
 * Or:   POST /api/admin/seed-demo
 *
 * Idempotent — deletes and recreates the demo site on each run.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

// ── Config ──────────────────────────────────────────────────────────────────

const DEMO_DOMAIN = "techtools-blog.com";
const DEMO_GSC_PROPERTY = "sc-domain:techtools-blog.com";
const DAYS_OF_DATA = 365;

// ── Page definitions ────────────────────────────────────────────────────────

type PageDef = {
  path: string;
  title: string;
  targetStatus: "critical" | "warning" | "healthy" | "dead" | "new";
  peakClicksPerDay: number;
  currentClicksPerDay: number;
  peakPosition: number;
  currentPosition: number;
  peakMonth: number;       // months ago when peak occurred (0 = this month)
  declineStartMonth: number; // months ago when decline started
  ageMonths: number;       // how old the page is
  queries: { query: string; clickShare: number; position: number }[];
};

const PAGES: PageDef[] = [
  // ── Critical (3) — had high traffic, now collapsed ──
  // decay target: 30-65% (critical = ≥30%, dead ≥70%+6mo)
  {
    path: "/blog/best-project-management-tools-2024",
    title: "Best Project Management Tools 2024 — TechTools Blog",
    targetStatus: "critical",
    peakClicksPerDay: 8,   // peak month ~220
    currentClicksPerDay: 3, // current 28d ~85 → decay ~61%
    peakPosition: 3,
    currentPosition: 12,
    peakMonth: 6,
    declineStartMonth: 4,
    ageMonths: 14,
    queries: [
      { query: "best project management tools", clickShare: 0.40, position: 12 },
      { query: "project management software", clickShare: 0.20, position: 15 },
      { query: "best pm tools 2024", clickShare: 0.15, position: 8 },
      { query: "monday vs asana vs clickup", clickShare: 0.10, position: 18 },
      { query: "project management tools comparison", clickShare: 0.08, position: 14 },
      { query: "top project management apps", clickShare: 0.07, position: 16 },
    ],
  },
  {
    path: "/blog/slack-vs-teams-comparison",
    title: "Slack vs Teams: Complete Comparison — TechTools Blog",
    targetStatus: "critical",
    peakClicksPerDay: 5.5, // peak month ~155
    currentClicksPerDay: 2.2, // current 28d ~62 → decay ~60%
    peakPosition: 5,
    currentPosition: 15,
    peakMonth: 8,
    declineStartMonth: 5,
    ageMonths: 16,
    queries: [
      { query: "slack vs teams", clickShare: 0.45, position: 15 },
      { query: "slack vs microsoft teams comparison", clickShare: 0.20, position: 16 },
      { query: "teams or slack which is better", clickShare: 0.15, position: 18 },
      { query: "slack teams pricing comparison", clickShare: 0.10, position: 14 },
      { query: "slack vs teams 2025", clickShare: 0.10, position: 20 },
    ],
  },
  {
    path: "/blog/remote-work-tools-guide",
    title: "The Ultimate Remote Work Tools Guide — TechTools Blog",
    targetStatus: "critical",
    peakClicksPerDay: 12,  // peak month ~340
    currentClicksPerDay: 5, // current 28d ~140 → decay ~59%
    peakPosition: 2,
    currentPosition: 9,
    peakMonth: 7,
    declineStartMonth: 5,
    ageMonths: 18,
    queries: [
      { query: "remote work tools", clickShare: 0.35, position: 9 },
      { query: "best tools for remote teams", clickShare: 0.20, position: 11 },
      { query: "work from home software", clickShare: 0.15, position: 10 },
      { query: "remote collaboration tools", clickShare: 0.12, position: 12 },
      { query: "remote work toolkit 2025", clickShare: 0.10, position: 14 },
      { query: "best remote work apps", clickShare: 0.08, position: 13 },
    ],
  },

  // ── Warning (5) — starting to decline ──
  {
    // decay target: 15-29% (warning)
    path: "/blog/notion-productivity-setup",
    title: "How to Set Up Notion for Maximum Productivity — TechTools Blog",
    targetStatus: "warning",
    peakClicksPerDay: 5.0,  // peak month ~140
    currentClicksPerDay: 3.8, // current 28d ~106 → decay ~24%
    peakPosition: 4,
    currentPosition: 7,
    peakMonth: 3,
    declineStartMonth: 2,
    ageMonths: 10,
    queries: [
      { query: "notion productivity setup", clickShare: 0.35, position: 7 },
      { query: "how to use notion for productivity", clickShare: 0.25, position: 8 },
      { query: "notion workspace setup guide", clickShare: 0.15, position: 6 },
      { query: "best notion templates productivity", clickShare: 0.15, position: 9 },
      { query: "notion gtd setup", clickShare: 0.10, position: 10 },
    ],
  },
  {
    path: "/blog/asana-vs-monday-2025",
    title: "Asana vs Monday.com 2025: Which Is Better? — TechTools Blog",
    targetStatus: "warning",
    peakClicksPerDay: 6.5,
    currentClicksPerDay: 5.3, // nudge up to keep decay <30%
    peakPosition: 3,
    currentPosition: 6,
    peakMonth: 4,
    declineStartMonth: 2,
    ageMonths: 9,
    queries: [
      { query: "asana vs monday", clickShare: 0.40, position: 6 },
      { query: "asana vs monday.com comparison", clickShare: 0.20, position: 7 },
      { query: "monday or asana which is better", clickShare: 0.15, position: 8 },
      { query: "asana monday pricing", clickShare: 0.15, position: 5 },
      { query: "project management asana vs monday", clickShare: 0.10, position: 9 },
    ],
  },
  {
    path: "/blog/best-crm-software-small-business",
    title: "Best CRM Software for Small Business — TechTools Blog",
    targetStatus: "warning",
    peakClicksPerDay: 4.0,  // peak month ~112
    currentClicksPerDay: 3.0, // current 28d ~84 → decay ~25%
    peakPosition: 5,
    currentPosition: 8,
    peakMonth: 5,
    declineStartMonth: 3,
    ageMonths: 12,
    queries: [
      { query: "best crm for small business", clickShare: 0.35, position: 8 },
      { query: "crm software small business", clickShare: 0.25, position: 9 },
      { query: "small business crm comparison", clickShare: 0.15, position: 7 },
      { query: "affordable crm tools", clickShare: 0.15, position: 10 },
      { query: "hubspot vs pipedrive small business", clickShare: 0.10, position: 12 },
    ],
  },
  {
    path: "/blog/zapier-automation-guide",
    title: "Zapier Automation Guide: 50 Workflows — TechTools Blog",
    targetStatus: "warning",
    peakClicksPerDay: 3.0,
    currentClicksPerDay: 2.5, // nudge up to keep decay <30%
    peakPosition: 6,
    currentPosition: 9,
    peakMonth: 4,
    declineStartMonth: 2,
    ageMonths: 11,
    queries: [
      { query: "zapier automation guide", clickShare: 0.30, position: 9 },
      { query: "best zapier workflows", clickShare: 0.25, position: 10 },
      { query: "zapier automation examples", clickShare: 0.20, position: 8 },
      { query: "how to automate with zapier", clickShare: 0.15, position: 11 },
      { query: "zapier integrations guide", clickShare: 0.10, position: 12 },
    ],
  },
  {
    path: "/blog/trello-alternatives",
    title: "10 Best Trello Alternatives in 2025 — TechTools Blog",
    targetStatus: "warning",
    peakClicksPerDay: 5.5,  // peak month ~154
    currentClicksPerDay: 4.3, // current 28d ~120 → decay ~22%
    peakPosition: 4,
    currentPosition: 7,
    peakMonth: 5,
    declineStartMonth: 3,
    ageMonths: 13,
    queries: [
      { query: "trello alternatives", clickShare: 0.40, position: 7 },
      { query: "best trello alternatives", clickShare: 0.20, position: 8 },
      { query: "trello alternative free", clickShare: 0.15, position: 6 },
      { query: "apps like trello", clickShare: 0.15, position: 9 },
      { query: "trello competitors", clickShare: 0.10, position: 10 },
    ],
  },

  // ── Healthy (8) — stable or growing ──
  {
    // decay target: <15% (healthy). Current ≈ peak so decay ≈ 0
    path: "/blog/how-to-use-notion-for-gtd",
    title: "How to Use Notion for GTD (Getting Things Done) — TechTools Blog",
    targetStatus: "healthy",
    peakClicksPerDay: 8.5,
    currentClicksPerDay: 8.8, // slightly above peak → decay 0
    peakPosition: 3,
    currentPosition: 3,
    peakMonth: 1,
    declineStartMonth: 0,
    ageMonths: 8,
    queries: [
      { query: "notion gtd", clickShare: 0.35, position: 3 },
      { query: "notion getting things done", clickShare: 0.25, position: 3 },
      { query: "gtd notion template", clickShare: 0.20, position: 4 },
      { query: "notion gtd setup guide", clickShare: 0.10, position: 5 },
      { query: "how to do gtd in notion", clickShare: 0.10, position: 4 },
    ],
  },
  {
    path: "/blog/clickup-review-2026",
    title: "ClickUp Review 2026: Features, Pricing, Pros & Cons — TechTools Blog",
    targetStatus: "healthy",
    peakClicksPerDay: 6.2,
    currentClicksPerDay: 6.5,
    peakPosition: 4,
    currentPosition: 4,
    peakMonth: 1,
    declineStartMonth: 0,
    ageMonths: 5,
    queries: [
      { query: "clickup review", clickShare: 0.35, position: 4 },
      { query: "clickup review 2026", clickShare: 0.25, position: 3 },
      { query: "is clickup good", clickShare: 0.15, position: 5 },
      { query: "clickup pros and cons", clickShare: 0.15, position: 6 },
      { query: "clickup pricing review", clickShare: 0.10, position: 4 },
    ],
  },
  {
    path: "/blog/best-free-project-management-tools",
    title: "Best Free Project Management Tools — TechTools Blog",
    targetStatus: "healthy",
    peakClicksPerDay: 11.5,
    currentClicksPerDay: 13.0, // bump current above peak more
    peakPosition: 2,
    currentPosition: 2,
    peakMonth: 1,
    declineStartMonth: 0,
    ageMonths: 11,
    queries: [
      { query: "free project management tools", clickShare: 0.35, position: 2 },
      { query: "best free pm tools", clickShare: 0.20, position: 3 },
      { query: "project management software free", clickShare: 0.20, position: 2 },
      { query: "free project management app", clickShare: 0.15, position: 3 },
      { query: "project management tools no cost", clickShare: 0.10, position: 4 },
    ],
  },
  {
    path: "/blog/todoist-vs-ticktick",
    title: "Todoist vs TickTick: Which Task Manager Wins? — TechTools Blog",
    targetStatus: "healthy",
    peakClicksPerDay: 4.4,
    currentClicksPerDay: 4.6,
    peakPosition: 5,
    currentPosition: 5,
    peakMonth: 1,
    declineStartMonth: 0,
    ageMonths: 7,
    queries: [
      { query: "todoist vs ticktick", clickShare: 0.45, position: 5 },
      { query: "ticktick vs todoist comparison", clickShare: 0.25, position: 5 },
      { query: "best task manager app", clickShare: 0.15, position: 8 },
      { query: "todoist or ticktick", clickShare: 0.15, position: 6 },
    ],
  },
  {
    path: "/blog/google-workspace-tips",
    title: "25 Google Workspace Tips You Probably Don't Know — TechTools Blog",
    targetStatus: "healthy",
    peakClicksPerDay: 3.0,
    currentClicksPerDay: 4.0, // well above peak to absorb noise → decay <15%
    peakPosition: 6,
    currentPosition: 6,
    peakMonth: 2,
    declineStartMonth: 0,
    ageMonths: 9,
    queries: [
      { query: "google workspace tips", clickShare: 0.35, position: 6 },
      { query: "google workspace tricks", clickShare: 0.25, position: 7 },
      { query: "google workspace productivity", clickShare: 0.20, position: 8 },
      { query: "google docs tips", clickShare: 0.20, position: 5 },
    ],
  },
  {
    path: "/blog/linear-app-review",
    title: "Linear App Review: The Best Issue Tracker? — TechTools Blog",
    targetStatus: "healthy",
    peakClicksPerDay: 9,
    currentClicksPerDay: 10, // growing — current > peak → decay 0
    peakPosition: 2,
    currentPosition: 2,
    peakMonth: 0,
    declineStartMonth: 0,
    ageMonths: 6,
    queries: [
      { query: "linear app review", clickShare: 0.35, position: 2 },
      { query: "linear issue tracker", clickShare: 0.25, position: 3 },
      { query: "linear vs jira", clickShare: 0.20, position: 4 },
      { query: "is linear app good", clickShare: 0.10, position: 3 },
      { query: "linear project management review", clickShare: 0.10, position: 5 },
    ],
  },
  {
    path: "/blog/basecamp-alternative-tools",
    title: "7 Basecamp Alternatives Worth Trying — TechTools Blog",
    targetStatus: "healthy",
    peakClicksPerDay: 2.7,
    currentClicksPerDay: 2.9,
    peakPosition: 7,
    currentPosition: 7,
    peakMonth: 2,
    declineStartMonth: 0,
    ageMonths: 10,
    queries: [
      { query: "basecamp alternatives", clickShare: 0.45, position: 7 },
      { query: "apps like basecamp", clickShare: 0.25, position: 8 },
      { query: "basecamp competitors", clickShare: 0.15, position: 9 },
      { query: "best basecamp alternative 2026", clickShare: 0.15, position: 7 },
    ],
  },
  {
    path: "/blog/productivity-apps-2026",
    title: "Best Productivity Apps 2026: Our Top Picks — TechTools Blog",
    targetStatus: "healthy",
    peakClicksPerDay: 5.4,
    currentClicksPerDay: 5.7,
    peakPosition: 4,
    currentPosition: 4,
    peakMonth: 1,
    declineStartMonth: 0,
    ageMonths: 5,
    queries: [
      { query: "best productivity apps 2026", clickShare: 0.35, position: 4 },
      { query: "productivity apps", clickShare: 0.25, position: 5 },
      { query: "top productivity tools", clickShare: 0.20, position: 6 },
      { query: "productivity software 2026", clickShare: 0.10, position: 4 },
      { query: "best apps for productivity", clickShare: 0.10, position: 5 },
    ],
  },

  // ── Dead (2) — barely any traffic ──
  {
    path: "/blog/best-project-management-tools-2022",
    title: "Best Project Management Tools 2022 — TechTools Blog",
    targetStatus: "dead",
    peakClicksPerDay: 28, // ~800/mo peak 2 years ago
    currentClicksPerDay: 0.1, // ~3/mo
    peakPosition: 1,
    currentPosition: 42,
    peakMonth: 18,
    declineStartMonth: 14,
    ageMonths: 24,
    queries: [
      { query: "best project management tools 2022", clickShare: 0.50, position: 35 },
      { query: "project management tools 2022", clickShare: 0.30, position: 40 },
      { query: "pm tools 2022", clickShare: 0.20, position: 38 },
    ],
  },
  {
    path: "/blog/hipchat-vs-slack",
    title: "HipChat vs Slack: Which Should You Choose? — TechTools Blog",
    targetStatus: "dead",
    peakClicksPerDay: 2.1, // ~60/mo
    currentClicksPerDay: 0.03, // ~1/mo
    peakPosition: 8,
    currentPosition: 50,
    peakMonth: 20,
    declineStartMonth: 16,
    ageMonths: 24,
    queries: [
      { query: "hipchat vs slack", clickShare: 0.60, position: 48 },
      { query: "hipchat alternative", clickShare: 0.25, position: 50 },
      { query: "hipchat shutdown", clickShare: 0.15, position: 30 },
    ],
  },

  // ── New (2) — recently published ──
  {
    path: "/blog/ai-project-management-tools-2026",
    title: "AI Project Management Tools: The 2026 Guide — TechTools Blog",
    targetStatus: "new",
    peakClicksPerDay: 1.6, // ~45/mo, growing
    currentClicksPerDay: 1.6,
    peakPosition: 8,
    currentPosition: 8,
    peakMonth: 0,
    declineStartMonth: 0,
    ageMonths: 2,
    queries: [
      { query: "ai project management tools", clickShare: 0.40, position: 8 },
      { query: "ai pm tools 2026", clickShare: 0.25, position: 7 },
      { query: "ai powered project management", clickShare: 0.20, position: 10 },
      { query: "best ai tools for project managers", clickShare: 0.15, position: 9 },
    ],
  },
  {
    path: "/blog/notion-calendar-review",
    title: "Notion Calendar Review: Is It Worth Switching? — TechTools Blog",
    targetStatus: "new",
    peakClicksPerDay: 0.4, // ~12/mo
    currentClicksPerDay: 0.4,
    peakPosition: 15,
    currentPosition: 15,
    peakMonth: 0,
    declineStartMonth: 0,
    ageMonths: 1,
    queries: [
      { query: "notion calendar review", clickShare: 0.45, position: 15 },
      { query: "notion calendar app", clickShare: 0.30, position: 16 },
      { query: "is notion calendar good", clickShare: 0.25, position: 18 },
    ],
  },
];

// ── Data generation helpers ─────────────────────────────────────────────────

function uuid(): string {
  return crypto.randomUUID();
}

/** Deterministic-ish random using a simple seed so reruns produce similar data. */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** CTR model based on SERP position. */
function ctrForPosition(position: number): number {
  if (position <= 1) return 0.28;
  if (position <= 2) return 0.15;
  if (position <= 3) return 0.10;
  if (position <= 4) return 0.07;
  if (position <= 5) return 0.05;
  if (position <= 7) return 0.03;
  if (position <= 10) return 0.015;
  if (position <= 20) return 0.005;
  if (position <= 30) return 0.002;
  return 0.001;
}

/** Weekend factor — B2B content dips on weekends. */
function weekendFactor(date: Date): number {
  const day = date.getUTCDay();
  if (day === 0) return 0.6; // Sunday
  if (day === 6) return 0.65; // Saturday
  return 1.0;
}

type DailyRow = {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avg_position: number;
};

/**
 * Generate daily metrics for a page over DAYS_OF_DATA days.
 * Models a realistic traffic curve: ramp-up → peak → optional decline.
 */
function generateDailyMetrics(pageDef: PageDef): DailyRow[] {
  const rows: DailyRow[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const dataStartDaysAgo = Math.min(pageDef.ageMonths * 30, DAYS_OF_DATA);
  const peakDaysAgo = pageDef.peakMonth * 30;
  const declineStartDaysAgo = pageDef.declineStartMonth * 30;

  for (let daysAgo = dataStartDaysAgo; daysAgo >= 0; daysAgo--) {
    const date = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().slice(0, 10);
    const dayIndex = dataStartDaysAgo - daysAgo; // 0 = first day of data
    const noise = seededRandom(daysAgo * 137 + pageDef.path.length);

    let baseClicks: number;
    let position: number;

    if (pageDef.targetStatus === "new") {
      // New pages: ramp up from near-zero
      const progress = dayIndex / dataStartDaysAgo;
      baseClicks = pageDef.currentClicksPerDay * progress * progress; // quadratic ramp
      position = pageDef.peakPosition + (20 - pageDef.peakPosition) * (1 - progress);
    } else if (pageDef.targetStatus === "dead") {
      // Dead: high peak long ago, sharp decline
      if (daysAgo >= peakDaysAgo) {
        // Before peak — ramp up phase
        const rampProgress = Math.min(1, (dataStartDaysAgo - daysAgo) / (dataStartDaysAgo - peakDaysAgo));
        baseClicks = pageDef.peakClicksPerDay * rampProgress;
        position = pageDef.peakPosition + (30 - pageDef.peakPosition) * (1 - rampProgress);
      } else if (daysAgo >= declineStartDaysAgo) {
        // Peak plateau
        baseClicks = pageDef.peakClicksPerDay;
        position = pageDef.peakPosition;
      } else {
        // Decline — exponential decay
        const declineDays = declineStartDaysAgo - daysAgo;
        const totalDeclineDays = declineStartDaysAgo;
        const declineProgress = Math.min(1, declineDays / totalDeclineDays);
        const decayFactor = Math.exp(-3.5 * declineProgress);
        baseClicks = pageDef.peakClicksPerDay * decayFactor + pageDef.currentClicksPerDay * (1 - decayFactor);
        position = pageDef.peakPosition + (pageDef.currentPosition - pageDef.peakPosition) * (1 - decayFactor);
      }
    } else if (pageDef.targetStatus === "critical" || pageDef.targetStatus === "warning") {
      // Decaying: peak then gradual decline
      if (daysAgo >= peakDaysAgo) {
        // Before peak — building up
        const rampProgress = Math.min(1, (dataStartDaysAgo - daysAgo) / Math.max(1, dataStartDaysAgo - peakDaysAgo));
        baseClicks = pageDef.peakClicksPerDay * (0.5 + 0.5 * rampProgress);
        position = pageDef.peakPosition + (pageDef.peakPosition + 5) * (1 - rampProgress);
      } else if (daysAgo >= declineStartDaysAgo) {
        // Peak plateau
        baseClicks = pageDef.peakClicksPerDay;
        position = pageDef.peakPosition;
      } else {
        // Decline — linear-ish with some curvature
        const declineDays = declineStartDaysAgo - daysAgo;
        const totalDeclineDays = declineStartDaysAgo;
        const declineProgress = Math.min(1, declineDays / totalDeclineDays);
        // S-curve decline (slow start, faster middle, slow end)
        const sCurve = 1 / (1 + Math.exp(-8 * (declineProgress - 0.4)));
        baseClicks = pageDef.peakClicksPerDay - (pageDef.peakClicksPerDay - pageDef.currentClicksPerDay) * sCurve;
        position = pageDef.peakPosition + (pageDef.currentPosition - pageDef.peakPosition) * sCurve;
      }
    } else if (pageDef.path === "/blog/linear-app-review") {
      // Growing healthy page — upward trend
      const progress = dayIndex / dataStartDaysAgo;
      baseClicks = pageDef.currentClicksPerDay * (0.4 + 0.6 * progress);
      position = pageDef.currentPosition + 5 * (1 - progress);
    } else {
      // Stable healthy — flat with minor variation
      baseClicks = pageDef.currentClicksPerDay;
      position = pageDef.currentPosition;
    }

    // Apply daily noise and weekend dip
    const noiseFactor = 1 + (noise - 0.5) * 0.4; // ±20%
    const wkFactor = weekendFactor(date);
    const clicks = Math.max(0, Math.round(baseClicks * noiseFactor * wkFactor));

    // Position noise (±0.5-1.5)
    const posNoise = (seededRandom(daysAgo * 251 + pageDef.path.length * 3) - 0.5) * 2;
    const finalPosition = Math.max(1, Math.round((position + posNoise) * 100) / 100);

    // Impressions = clicks / CTR (with noise)
    const ctr = ctrForPosition(finalPosition);
    const impressions = clicks > 0 ? Math.max(clicks, Math.round(clicks / ctr * (0.8 + noise * 0.4))) : Math.round(20 + noise * 100);
    const actualCtr = impressions > 0 ? Math.round((clicks / impressions) * 10000) / 10000 : 0;

    rows.push({
      date: dateStr,
      clicks,
      impressions,
      ctr: actualCtr,
      avg_position: finalPosition,
    });
  }

  return rows;
}

// ── Mock diagnosis data ─────────────────────────────────────────────────────

function buildMockDiagnosis(pageDef: PageDef) {
  const diagnosis = {
    summary: `Your page "${pageDef.title.split(" — ")[0]}" was performing well at position #${pageDef.peakPosition} with ~${Math.round(pageDef.peakClicksPerDay * 30)} clicks/month, but has declined to position #${pageDef.currentPosition} with ~${Math.round(pageDef.currentClicksPerDay * 28)} clicks in the last 28 days — a ${Math.round((1 - pageDef.currentClicksPerDay / pageDef.peakClicksPerDay) * 100)}% drop. The good news: your content has solid structure and covers the core topic well. The bad news: competitors have published fresher, more comprehensive content that Google now prefers. Here's exactly what happened and what to fix.`,
    strengths: [
      `Your article structure is clean with well-organized H2/H3 headings that make it easy to scan.`,
      `You cover ${Math.floor(3 + Math.random() * 3)} core subtopics that competitors miss, including detailed pricing breakdowns.`,
      `Your word count (${2000 + Math.floor(Math.random() * 1500)}) is competitive with the SERP average.`,
    ],
    topic_coverage: {
      covered: 7,
      total: 12,
      percentage: 58,
      missing: [
        "AI features comparison",
        "Integration ecosystem",
        "Mobile app experience",
        "Customer support quality",
        "Enterprise pricing tiers",
      ],
    },
    causes: [
      {
        title: "Outdated data and screenshots",
        description: `Your article references 2024 data and pricing. SERP #1 (competitor.com) and SERP #2 (rival.io) both published 2026 updates in the last 60 days. Google strongly favors freshness for "[year]" queries — your page is now 14+ months old without updates.`,
        severity: "high" as const,
        evidence: `SERP #1 published Feb 2026 with "Updated March 2026" badge. Your last-modified date shows January 2025. SERP #2 has 2026 screenshots while yours show 2024 UI. Google's helpful content system penalizes stale comparison content.`,
        category: "outdated_content" as const,
      },
      {
        title: "Missing AI features comparison — new user intent",
        description: `Since Q4 2025, searchers increasingly want AI feature comparisons. SERP #1 and #3 both added "AI Features" sections (H2) covering AI assistants, AI project planning, and AI writing in each tool. Your article has zero mention of AI capabilities.`,
        severity: "high" as const,
        evidence: `SERP #1 (competitor.com) has a 400-word "AI Features Showdown" section. SERP #3 (techsite.com) has an "AI Integration" comparison table. Neither existed 6 months ago. This represents an intent shift — ~30% of searchers now specifically want AI feature info.`,
        category: "missing_topic" as const,
      },
      {
        title: "Competitors added video walkthroughs",
        description: `SERP #1 and #2 both embed 5-10 minute video walkthroughs of each tool. Your page is text-only. Google increasingly favors mixed-media content for comparison queries, and users spend 3x longer on pages with embedded video.`,
        severity: "medium" as const,
        evidence: `SERP #1 has embedded YouTube video (45K views). SERP #2 has a custom Loom walkthrough. Format trend in this SERP is shifting toward video+text hybrid content.`,
        category: "format_gap" as const,
      },
    ],
    serp_analysis: {
      top_competitors: [
        { url: "https://competitor.com/blog/best-pm-tools", title: "Best Project Management Tools 2026", strengths: ["Updated March 2026", "AI features section", "Video walkthrough"] },
        { url: "https://rival.io/comparisons/pm-tools", title: "PM Tools Compared: 2026 Edition", strengths: ["Interactive comparison table", "User reviews section", "Free trial links"] },
        { url: "https://techsite.com/project-management-software", title: "Top 10 Project Management Software", strengths: ["AI integration comparison", "Pricing calculator", "4200 words"] },
      ],
      intent_type: "commercial" as const,
      content_format_trend: "Comprehensive comparison with interactive tables, AI feature sections, and embedded video walkthroughs. Top results average 3800 words.",
    },
  };

  const brief = {
    total_effort_hours: 6,
    actions: [
      {
        priority: "urgent" as const,
        title: "Update all pricing, features, and screenshots to 2026",
        description: "Your pricing table shows 2024 data. SERP #1 has March 2026 pricing. This is the single highest-impact fix — Google's freshness signal heavily penalizes outdated comparison content. Fix this in ~2 hours → potentially recover ~80 clicks/month.",
        effort_minutes: 120,
        category: "content" as const,
        micro_draft: {
          type: "corrected_data" as const,
          suggestions: [
            "Update title to: 'Best Project Management Tools 2026: Complete Comparison'",
            "Update all pricing tables — verify current plans at each tool's pricing page",
            "Replace screenshots with current UI (March 2026 versions). Each tool has changed their dashboard since 2024.",
            "Add 'Last updated: March 2026' prominently near the title",
          ],
          competitor_references: ["competitor.com updated Feb 2026", "rival.io updated Jan 2026"],
        },
      },
      {
        priority: "urgent" as const,
        title: "Add AI Features comparison section",
        description: "This is a new intent gap that didn't exist when you wrote the article. ~30% of searchers now want AI feature comparisons. SERP #1 has a dedicated 400-word section. Reader impact: users can make informed decisions about AI capabilities without visiting another page.",
        effort_minutes: 90,
        category: "content" as const,
        micro_draft: {
          type: "topics_to_cover" as const,
          suggestions: [
            "Opening sentence: 'Every major PM tool added AI features in 2025-2026. Here's how they actually compare in practice — not just marketing claims.'",
            "Cover for each tool: AI task creation, AI project planning, AI writing assistant, AI time estimates",
            "Add a comparison table with columns: Tool | AI Assistant | AI Planning | AI Writing | AI Insights | Cost of AI tier",
            "Conclude with: 'Our pick for best AI features: [tool] — here's why it's ahead of the pack.'",
          ],
          competitor_references: ["SERP #1 competitor.com: 400-word AI Features Showdown section", "SERP #3 techsite.com: AI Integration comparison table"],
        },
      },
      {
        priority: "important" as const,
        title: "Rewrite meta title and description for 2026",
        description: "Your current title says '2024' which actively repels clicks. SERP #1 shows '2026' in the title. A title update alone could improve CTR by 15-25% at your current position. Fix this in ~10 min → potentially recover ~15 clicks/month just from CTR improvement.",
        effort_minutes: 10,
        category: "meta" as const,
        micro_draft: {
          type: "meta_text" as const,
          suggestions: [
            "Title option 1: 'Best Project Management Tools 2026: 12 Tools Compared (With Pricing)'",
            "Title option 2: '12 Best Project Management Tools in 2026 — Tested & Ranked'",
            "Meta description: 'We tested 12 project management tools head-to-head. See our 2026 comparison with pricing, AI features, pros/cons, and which tool fits your team size. Updated March 2026.'",
          ],
        },
      },
      {
        priority: "nice_to_have" as const,
        title: "Add FAQ section targeting long-tail queries",
        description: "SERP #1 has a 6-question FAQ that captures featured snippets. Your GSC data shows impressions for question queries you're not ranking for. Reader impact: answers common questions without users needing to search further.",
        effort_minutes: 45,
        category: "structure" as const,
        micro_draft: {
          type: "topics_to_cover" as const,
          suggestions: [
            "Q: What is the best free project management tool? A: For small teams (under 5), ClickUp's free plan offers the most features including unlimited tasks, docs, and 100MB storage. For simplicity, Trello's free plan is hard to beat with unlimited boards and cards.",
            "Q: Is Monday.com worth the price? A: Monday.com starts at $9/seat/month (minimum 3 seats = $27/month). It's worth it if you need visual workflows and automations. For tighter budgets, Asana's free plan covers most basics.",
            "Q: Which project management tool has the best AI features? A: As of 2026, ClickUp and Monday.com lead in AI capabilities. ClickUp's AI can generate tasks, summarize projects, and write docs. Monday.com's AI excels at workflow automation suggestions.",
          ],
        },
      },
    ],
  };

  return { diagnosis, brief };
}

// ── Main seed function ──────────────────────────────────────────────────────

export async function seedDemo(admin: SupabaseClient, userId: string): Promise<{
  siteId: string;
  pagesCreated: number;
  metricsRows: number;
  queriesRows: number;
}> {
  console.log("[seed-demo] Starting...");

  // Step 0: Delete existing demo site (idempotent)
  const { data: existingSite } = await admin
    .from("sites")
    .select("id")
    .eq("domain", DEMO_DOMAIN)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingSite) {
    console.log("[seed-demo] Deleting existing demo site...");
    // CASCADE deletes pages → page_metrics_daily, page_queries, diagnoses, refreshes
    await admin.from("sites").delete().eq("id", existingSite.id);
  }

  // Step 1: Create demo site
  const siteId = uuid();
  const now = new Date().toISOString();

  const { error: siteErr } = await admin.from("sites").insert({
    id: siteId,
    user_id: userId,
    domain: DEMO_DOMAIN,
    gsc_property: DEMO_GSC_PROPERTY,
    gsc_refresh_token: "demo-token-not-real",
    status: "active",
    health_score: null,
    last_sync_at: now,
    last_engine_run_at: null, // engine will set this
    has_free_diagnosis: true,
    auto_diagnosis_status: "completed",
    welcome_dismissed: true,
    free_diag_dismissed: true,
    created_at: now,
    updated_at: now,
  });

  if (siteErr) throw new Error(`Failed to create site: ${siteErr.message}`);
  console.log(`[seed-demo] Created site ${siteId}`);

  // Step 2 & 3: Create pages with daily metrics
  let totalMetricsRows = 0;
  let totalQueriesRows = 0;
  const pageIds: string[] = [];

  for (const pageDef of PAGES) {
    const pageId = uuid();
    pageIds.push(pageId);

    const pageUrl = `https://${DEMO_DOMAIN}${pageDef.path}`;
    const createdAt = new Date();
    createdAt.setMonth(createdAt.getMonth() - pageDef.ageMonths);

    // Generate daily metrics
    const dailyMetrics = generateDailyMetrics(pageDef);

    // Calculate current 28d stats from generated data
    const last28 = dailyMetrics.slice(-28);
    const current28dClicks = last28.reduce((s, m) => s + m.clicks, 0);
    const current28dImpressions = last28.reduce((s, m) => s + m.impressions, 0);
    const avgCtr = last28.length > 0 ? last28.reduce((s, m) => s + m.ctr, 0) / last28.length : 0;
    const avgPos = last28.length > 0 ? last28.reduce((s, m) => s + m.avg_position, 0) / last28.length : 0;

    // Calculate peak monthly from data
    const monthlyClicks = new Map<string, number>();
    for (const m of dailyMetrics) {
      const month = m.date.slice(0, 7);
      monthlyClicks.set(month, (monthlyClicks.get(month) ?? 0) + m.clicks);
    }
    let peakClicks = 0;
    let peakMonth: string | null = null;
    for (const [month, clicks] of monthlyClicks) {
      if (clicks > peakClicks) {
        peakClicks = clicks;
        peakMonth = month;
      }
    }

    // Calculate decay score
    let decayScore = 0;
    if (peakClicks >= 10 && current28dClicks < peakClicks) {
      decayScore = Math.round(((peakClicks - current28dClicks) / peakClicks) * 10000) / 100;
    }
    decayScore = Math.min(decayScore, 100);

    // Primary keyword = first query
    const primaryQuery = pageDef.queries[0]!;

    // Insert page
    const { error: pageErr } = await admin.from("pages").insert({
      id: pageId,
      site_id: siteId,
      url: pageUrl,
      path: pageDef.path,
      title: pageDef.title,
      current_clicks_28d: current28dClicks,
      current_impressions_28d: current28dImpressions,
      current_ctr: Math.round(avgCtr * 10000) / 10000,
      current_avg_position: Math.round(avgPos * 100) / 100,
      peak_clicks_monthly: peakClicks,
      peak_month: peakMonth ? `${peakMonth}-01` : null,
      decay_score: decayScore,
      status: pageDef.targetStatus,
      primary_keyword: primaryQuery.query,
      primary_position: primaryQuery.position,
      keyword_source: "clicks",
      created_at: createdAt.toISOString(),
      updated_at: now,
    });

    if (pageErr) throw new Error(`Failed to create page ${pageDef.path}: ${pageErr.message}`);

    // Insert daily metrics in batches of 200
    const metricRows = dailyMetrics.map((m) => ({
      page_id: pageId,
      date: m.date,
      clicks: m.clicks,
      impressions: m.impressions,
      ctr: m.ctr,
      avg_position: m.avg_position,
    }));

    for (let i = 0; i < metricRows.length; i += 200) {
      const batch = metricRows.slice(i, i + 200);
      const { error: metricsErr } = await admin
        .from("page_metrics_daily")
        .insert(batch);
      if (metricsErr) throw new Error(`Failed to insert metrics for ${pageDef.path}: ${metricsErr.message}`);
    }
    totalMetricsRows += metricRows.length;

    // Step 4: Insert page_queries (aggregated — use "today" as date)
    const today = new Date().toISOString().slice(0, 10);
    const totalDailyClicks = pageDef.currentClicksPerDay * 28;
    const queryRows = pageDef.queries.map((q) => {
      const clicks = Math.max(1, Math.round(totalDailyClicks * q.clickShare));
      const ctr = ctrForPosition(q.position);
      const impressions = Math.max(clicks, Math.round(clicks / ctr));
      return {
        page_id: pageId,
        query: q.query,
        date: today,
        clicks,
        impressions,
        ctr: Math.round((clicks / impressions) * 10000) / 10000,
        position: q.position,
      };
    });

    const { error: queryErr } = await admin.from("page_queries").insert(queryRows);
    if (queryErr) throw new Error(`Failed to insert queries for ${pageDef.path}: ${queryErr.message}`);
    totalQueriesRows += queryRows.length;

    console.log(`[seed-demo] Page: ${pageDef.path} (${pageDef.targetStatus}) — ${metricRows.length} daily rows, decay=${decayScore.toFixed(1)}%`);
  }

  // Step 6: Create mock diagnosis for page #1 (critical)
  const page1Id = pageIds[0]!;
  const page1Def = PAGES[0]!;
  const { diagnosis: mockDiag, brief: mockBrief } = buildMockDiagnosis(page1Def);
  const diagId = uuid();

  const { error: diagErr } = await admin.from("diagnoses").insert({
    id: diagId,
    page_id: page1Id,
    user_id: userId,
    diagnosis: mockDiag,
    refresh_brief: mockBrief,
    serp_snapshot: {
      keyword: page1Def.queries[0]!.query,
      results: mockDiag.serp_analysis.top_competitors.map((c, i) => ({
        url: c.url,
        title: c.title,
        snippet: c.strengths.join(". "),
        position: i + 1,
      })),
      fetched_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    },
    model_used: "claude-opus-4-6",
    tokens_input: 12500,
    tokens_output: 3200,
    cost_usd: 0.1425,
    processing_time_ms: 145000,
    triggered_by: "manual",
    keyword_used: page1Def.queries[0]!.query,
    keyword_source: "gsc",
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  });

  if (diagErr) throw new Error(`Failed to create diagnosis: ${diagErr.message}`);
  console.log("[seed-demo] Created mock diagnosis for page #1");

  // Update page last_diagnosis_at
  await admin.from("pages").update({
    last_diagnosis_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  }).eq("id", page1Id);

  // Step 7: Create completed refresh for page #1
  // Before metrics: from 35 days ago data
  const page1Metrics = generateDailyMetrics(page1Def);
  const before28d = page1Metrics.slice(-63, -35);
  const after28d = page1Metrics.slice(-28);

  const beforeClicks = before28d.reduce((s, m) => s + m.clicks, 0);
  const beforeImpr = before28d.reduce((s, m) => s + m.impressions, 0);
  const beforeCtr = before28d.length > 0 ? before28d.reduce((s, m) => s + m.ctr, 0) / before28d.length : 0;
  const beforePos = before28d.length > 0 ? before28d.reduce((s, m) => s + m.avg_position, 0) / before28d.length : 0;

  // After = slightly improved (simulate partial recovery after refresh)
  const afterClicks = after28d.reduce((s, m) => s + m.clicks, 0) + 12; // +12 simulates partial improvement
  const afterImpr = after28d.reduce((s, m) => s + m.impressions, 0);
  const afterCtr = after28d.length > 0 ? after28d.reduce((s, m) => s + m.ctr, 0) / after28d.length + 0.002 : 0;
  const afterPos = after28d.length > 0 ? after28d.reduce((s, m) => s + m.avg_position, 0) / after28d.length - 0.8 : 0;

  const clicksDelta = afterClicks - beforeClicks;
  const clicksDeltaPct = beforeClicks > 0 ? Math.round((clicksDelta / beforeClicks) * 10000) / 100 : 0;

  const refreshId = uuid();
  const { error: refreshErr } = await admin.from("refreshes").insert({
    id: refreshId,
    page_id: page1Id,
    diagnosis_id: diagId,
    user_id: userId,
    refreshed_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    actions_completed: [mockBrief.actions[0]!.title, mockBrief.actions[2]!.title],
    before_clicks_28d: beforeClicks,
    before_impressions_28d: beforeImpr,
    before_ctr: Math.round(beforeCtr * 10000) / 10000,
    before_avg_position: Math.round(beforePos * 100) / 100,
    after_clicks_28d: afterClicks,
    after_impressions_28d: afterImpr,
    after_ctr: Math.round(afterCtr * 10000) / 10000,
    after_avg_position: Math.round(afterPos * 100) / 100,
    result_status: "success",
    result_calculated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    clicks_delta: clicksDelta,
    clicks_delta_pct: clicksDeltaPct,
  });

  if (refreshErr) throw new Error(`Failed to create refresh: ${refreshErr.message}`);
  console.log(`[seed-demo] Created completed refresh for page #1 (delta: ${clicksDelta > 0 ? "+" : ""}${clicksDelta} clicks, ${clicksDeltaPct > 0 ? "+" : ""}${clicksDeltaPct}%)`);

  console.log(`[seed-demo] Done! Site: ${siteId}, Pages: ${PAGES.length}, Metrics: ${totalMetricsRows}, Queries: ${totalQueriesRows}`);
  console.log("[seed-demo] Next: run the decay engine on this site to recalculate classifications and health score.");

  return {
    siteId,
    pagesCreated: PAGES.length,
    metricsRows: totalMetricsRows,
    queriesRows: totalQueriesRows,
  };
}

// ── CLI entry point ─────────────────────────────────────────────────────────

async function main() {
  // Load env from .env.local
  const dotenv = await import("dotenv");
  dotenv.config({ path: ".env.local" });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\s/g, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\s/g, "");
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  if (!adminEmail) {
    console.error("Missing ADMIN_EMAIL in .env.local");
    process.exit(1);
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Find admin user
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", adminEmail)
    .single();

  if (!profile) {
    console.error(`No profile found for ${adminEmail}`);
    process.exit(1);
  }

  const result = await seedDemo(admin, profile.id);

  console.log("\n✅ Seed complete!");
  console.log(`   Site ID:  ${result.siteId}`);
  console.log(`   Pages:    ${result.pagesCreated}`);
  console.log(`   Metrics:  ${result.metricsRows} daily rows`);
  console.log(`   Queries:  ${result.queriesRows} query rows`);
  console.log(`\n   Run decay engine: curl -X POST http://localhost:3000/api/admin/seed-demo?run_engine=true`);
}

// Only run when executed directly (not imported by API route)
const isDirectExecution = process.argv[1]?.includes("seed-demo");
if (isDirectExecution) {
  main().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}
