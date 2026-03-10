import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { runEngine } from "@/lib/engine/run-engine";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Get all active sites with sync timestamps
  const { data: sites, error: sitesErr } = await admin
    .from("sites")
    .select("id, last_sync_at, last_engine_run_at")
    .eq("status", "active");

  if (sitesErr || !sites) {
    console.error("[cron/run-engine] Failed to fetch sites:", sitesErr);
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 });
  }

  console.log(`[cron/run-engine] Found ${sites.length} active sites`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const site of sites) {
    try {
      // Only run engine if sync happened after last engine run
      if (site.last_engine_run_at && site.last_sync_at) {
        const lastSync = new Date(site.last_sync_at).getTime();
        const lastEngine = new Date(site.last_engine_run_at).getTime();
        if (lastSync <= lastEngine) {
          skipped++;
          continue;
        }
      }

      // No sync data at all — skip
      if (!site.last_sync_at) {
        skipped++;
        continue;
      }

      const result = await runEngine(admin, site.id);
      processed++;
      console.log(`[cron/run-engine] Site ${site.id}: health=${result.healthScore}, pages=${result.pagesCount}`);
    } catch (err) {
      console.error(`[cron/run-engine] Site ${site.id} error:`, err);
      errors++;
    }
  }

  console.log(`[cron/run-engine] Done. Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors}`);
  return NextResponse.json({ data: { processed, skipped, errors, total: sites.length } });
}
