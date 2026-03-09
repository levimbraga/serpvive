import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Find pages that recently transitioned to "critical" status
  // Look at pages updated in the last 24 hours with critical/dead status
  // that don't have a recent diagnosis (alerts only, NO auto-diagnosis)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: criticalPages, error: fetchErr } = await admin
    .from("pages")
    .select(`
      id, url, path, status, decay_score, decay_velocity_7d,
      site_id, last_diagnosis_at,
      sites!inner(user_id, domain, status)
    `)
    .in("status", ["critical", "dead"])
    .gte("updated_at", oneDayAgo)
    .eq("sites.status", "active");

  if (fetchErr) {
    console.error("[cron/batch-alert] Fetch error:", fetchErr);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }

  if (!criticalPages || criticalPages.length === 0) {
    console.log("[cron/batch-alert] No new critical pages found");
    return NextResponse.json({ data: { alerts: 0 } });
  }

  // Filter to pages that haven't been diagnosed recently (7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const needsAttention = criticalPages.filter((p) => {
    if (!p.last_diagnosis_at) return true;
    return new Date(p.last_diagnosis_at) < sevenDaysAgo;
  });

  console.log(`[cron/batch-alert] Found ${needsAttention.length} pages needing attention (of ${criticalPages.length} critical/dead)`);

  // For now, just log the alerts. Email notifications will be added with Resend integration.
  // In production this would create notification records or send alerts.
  for (const page of needsAttention) {
    console.log(`[cron/batch-alert] ALERT: ${page.path} (${page.status}, decay: ${page.decay_score}%, velocity: ${page.decay_velocity_7d}%)`);
  }

  return NextResponse.json({
    data: {
      alerts: needsAttention.length,
      totalCritical: criticalPages.length,
    },
  });
}
