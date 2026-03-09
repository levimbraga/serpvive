import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Find all pending refreshes older than 28 days
  const cutoff = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();

  const { data: pendingRefreshes, error: fetchErr } = await admin
    .from("refreshes")
    .select("id, page_id, before_clicks_28d, before_impressions_28d, before_ctr, before_avg_position")
    .eq("result_status", "pending")
    .lt("refreshed_at", cutoff);

  if (fetchErr) {
    console.error("[cron/measure-results] Fetch error:", fetchErr);
    return NextResponse.json({ error: "Failed to fetch refreshes" }, { status: 500 });
  }

  if (!pendingRefreshes || pendingRefreshes.length === 0) {
    console.log("[cron/measure-results] No pending refreshes to measure");
    return NextResponse.json({ data: { measured: 0 } });
  }

  console.log(`[cron/measure-results] Measuring ${pendingRefreshes.length} refreshes`);

  let measured = 0;
  let errors = 0;

  for (const refresh of pendingRefreshes) {
    try {
      // Get current page metrics
      const { data: page } = await admin
        .from("pages")
        .select("current_clicks_28d, current_impressions_28d, current_ctr, current_avg_position")
        .eq("id", refresh.page_id)
        .single();

      if (!page) {
        console.error(`[cron/measure-results] Page ${refresh.page_id} not found`);
        errors++;
        continue;
      }

      const beforeClicks = refresh.before_clicks_28d ?? 0;
      const afterClicks = page.current_clicks_28d ?? 0;
      const clicksDelta = afterClicks - beforeClicks;
      const clicksDeltaPct = beforeClicks > 0
        ? (clicksDelta / beforeClicks) * 100
        : (afterClicks > 0 ? 100 : 0);

      // Classify: >+10% success, 0-10% partial, ~0% no_change, <-5% declined
      let resultStatus: string;
      if (clicksDeltaPct > 10) {
        resultStatus = "success";
      } else if (clicksDeltaPct >= 0) {
        resultStatus = "partial";
      } else if (clicksDeltaPct >= -5) {
        resultStatus = "no_change";
      } else {
        resultStatus = "declined";
      }

      const { error: updateErr } = await admin
        .from("refreshes")
        .update({
          after_clicks_28d: page.current_clicks_28d,
          after_impressions_28d: page.current_impressions_28d,
          after_ctr: page.current_ctr,
          after_avg_position: page.current_avg_position,
          clicks_delta: clicksDelta,
          clicks_delta_pct: Math.round(clicksDeltaPct * 100) / 100,
          result_status: resultStatus,
          result_calculated_at: new Date().toISOString(),
        })
        .eq("id", refresh.id);

      if (updateErr) {
        console.error(`[cron/measure-results] Update error for ${refresh.id}:`, updateErr);
        errors++;
      } else {
        measured++;
        console.log(`[cron/measure-results] ${refresh.id}: ${beforeClicks} → ${afterClicks} (${clicksDeltaPct.toFixed(1)}%) = ${resultStatus}`);
      }
    } catch (err) {
      console.error(`[cron/measure-results] Error processing ${refresh.id}:`, err);
      errors++;
    }
  }

  console.log(`[cron/measure-results] Done. Measured: ${measured}, Errors: ${errors}`);
  return NextResponse.json({ data: { measured, errors, total: pendingRefreshes.length } });
}
