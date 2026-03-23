import { resend, FROM_EMAIL, FOUNDER_EMAIL } from "./resend";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generateUnsubscribeToken } from "@/lib/email/unsubscribe";
import WeeklyDigest from "./templates/weekly-digest";
import OnboardingDay0 from "./templates/onboarding-day0";
import OnboardingDay2 from "./templates/onboarding-day2";
import OnboardingDay3 from "./templates/onboarding-day3";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://serpvive.com";

function getUnsubscribeUrl(userId: string): string {
  const token = generateUnsubscribeToken(userId);
  return `${APP_URL}/api/email/unsubscribe?uid=${userId}&token=${token}`;
}

export async function sendWeeklyDigest(userId: string, siteId: string) {
  const admin = getSupabaseAdmin();

  const [profileRes, siteRes] = await Promise.all([
    admin.from("profiles").select("email, full_name").eq("id", userId).single(),
    admin
      .from("sites")
      .select("domain, health_score, health_score_prev, pages_critical, pages_dead")
      .eq("id", siteId)
      .single(),
  ]);

  const profile = profileRes.data;
  const site = siteRes.data;
  if (!profile?.email || !site) return;

  const healthScore = site.health_score ?? 0;
  const healthScorePrev = site.health_score_prev ?? healthScore;
  const healthScoreDelta = healthScore - healthScorePrev;

  // Top 3 urgent pages
  const { data: urgent } = await admin
    .from("pages")
    .select("url, path, decay_score, status")
    .eq("site_id", siteId)
    .in("status", ["critical", "dead", "warning"])
    .order("decay_score", { ascending: false })
    .limit(3);

  // Recent refresh results
  const { data: results } = await admin
    .from("refreshes")
    .select("page_id, clicks_delta_pct, result_status")
    .eq("user_id", userId)
    .in("result_status", ["success", "partial", "no_change", "declined"])
    .order("result_calculated_at", { ascending: false })
    .limit(3);

  // Map page_ids to URLs for results
  const resultPageIds = (results ?? []).map((r) => r.page_id);
  const { data: resultPages } = resultPageIds.length > 0
    ? await admin.from("pages").select("id, path").in("id", resultPageIds)
    : { data: [] };
  const pageMap = new Map((resultPages ?? []).map((p) => [p.id, p.path]));

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: profile.email,
    subject: `${site.domain}: Health ${healthScore}/100 ${healthScoreDelta >= 0 ? "↑" : "↓"}${Math.abs(healthScoreDelta)} — Weekly Digest`,
    headers: {
      "List-Unsubscribe": `<${getUnsubscribeUrl(userId)}>`,
    },
    react: WeeklyDigest({
      userName: profile.full_name ?? "there",
      siteDomain: site.domain,
      healthScore,
      healthScoreDelta,
      urgentPages: (urgent ?? []).map((p) => ({
        url: p.path,
        title: p.path,
        decayScore: p.decay_score,
        status: p.status,
      })),
      recentResults: (results ?? []).map((r) => ({
        url: pageMap.get(r.page_id) ?? "Unknown",
        clicksDeltaPct: r.clicks_delta_pct ?? 0,
        resultStatus: r.result_status,
      })),
      dashboardUrl: `${APP_URL}/dashboard`,
      unsubscribeUrl: getUnsubscribeUrl(userId),
    }),
  });

  if (error) {
    console.error("[email] Weekly digest error:", error);
  } else {
    console.log("[email] Weekly digest sent to", profile.email);
  }
}

export async function sendOnboardingDay0(userId: string, siteId: string) {
  const admin = getSupabaseAdmin();

  const [profileRes, siteRes] = await Promise.all([
    admin.from("profiles").select("email, full_name").eq("id", userId).single(),
    admin
      .from("sites")
      .select("domain, health_score, pages_count, pages_critical, pages_dead")
      .eq("id", siteId)
      .single(),
  ]);

  const profile = profileRes.data;
  const site = siteRes.data;
  if (!profile?.email || !site) return;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: profile.email,
    subject: `Your blog health score: ${site.health_score ?? 0}/100`,
    react: OnboardingDay0({
      userName: profile.full_name ?? "there",
      siteDomain: site.domain,
      healthScore: site.health_score ?? 0,
      pagesMonitored: site.pages_count ?? 0,
      criticalCount: (site.pages_critical ?? 0) + (site.pages_dead ?? 0),
      dashboardUrl: `${APP_URL}/dashboard`,
    }),
  });

  if (error) {
    console.error("[email] Onboarding day 0 error:", error);
  } else {
    console.log("[email] Onboarding day 0 sent to", profile.email);
  }
}

export async function sendOnboardingDay2(userId: string) {
  const admin = getSupabaseAdmin();

  const { data: profile } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();
  if (!profile?.email) return;

  // Get first active site
  const { data: site } = await admin
    .from("sites")
    .select("id, domain")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!site) return;

  // Find most urgent page
  const { data: urgent } = await admin
    .from("pages")
    .select("id, url, path, decay_score, current_clicks_28d, peak_clicks_monthly")
    .eq("site_id", site.id)
    .order("decay_score", { ascending: false })
    .limit(1)
    .maybeSingle();

  const topUrgentPage = urgent
    ? {
        url: urgent.path,
        title: urgent.path,
        decayScore: urgent.decay_score ?? 0,
        clicksLost: Math.max(0, (urgent.peak_clicks_monthly ?? 0) - (urgent.current_clicks_28d ?? 0)),
        pageId: urgent.id,
      }
    : null;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: profile.email,
    subject: topUrgentPage && topUrgentPage.clicksLost > 0
      ? `Your post is losing ~${topUrgentPage.clicksLost} clicks/month`
      : "How SerpVive keeps your content performing",
    react: OnboardingDay2({
      userName: profile.full_name ?? "there",
      siteDomain: site.domain,
      topUrgentPage,
      dashboardUrl: `${APP_URL}/dashboard`,
    }),
  });

  if (error) {
    console.error("[email] Onboarding day 2 error:", error);
  } else {
    console.log("[email] Onboarding day 2 sent to", profile.email);
  }
}

export async function sendOnboardingDay3(userId: string) {
  const admin = getSupabaseAdmin();

  const { data: profile } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();
  if (!profile?.email) return;

  // Get first active site
  const { data: site } = await admin
    .from("sites")
    .select("id, domain, pages_count, pages_critical, pages_dead")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!site) return;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: profile.email,
    subject: `Unlock AI diagnoses for ${site.domain}`,
    react: OnboardingDay3({
      userName: profile.full_name ?? "there",
      siteDomain: site.domain,
      pagesMonitored: site.pages_count ?? 0,
      criticalCount: (site.pages_critical ?? 0) + (site.pages_dead ?? 0),
      dashboardUrl: `${APP_URL}/dashboard`,
    }),
  });

  if (error) {
    console.error("[email] Onboarding day 3 error:", error);
  } else {
    console.log("[email] Onboarding day 3 sent to", profile.email);
  }
}

export async function sendCancelFeedbackEmail(userId: string) {
  const admin = getSupabaseAdmin();

  const { data: profile } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  if (!profile?.email) return;

  const firstName = profile.full_name?.split(" ")[0] ?? "there";

  const { error } = await resend.emails.send({
    from: FOUNDER_EMAIL,
    to: profile.email,
    replyTo: "levimaiabraga@gmail.com",
    subject: "Quick question about your cancellation",
    text: `Hi ${firstName},

I'm Levi, the founder of SerpVive. I noticed you just canceled.

No hard feelings at all — but I'd love to understand why. Even 4 words would help me make SerpVive better.

Was it:
- Not useful enough?
- Too expensive?
- Missing a feature you needed?
- Something else?

Just reply to this email. I read every response personally.

Thanks for giving SerpVive a try.

— Levi
Founder, SerpVive`,
  });

  if (error) {
    console.error("[email] Cancel feedback error:", error);
  } else {
    console.log("[email] Cancel feedback sent to", profile.email);
  }
}
