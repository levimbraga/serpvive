import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { refreshAccessToken, getSearchAnalyticsByPageAndDate, getTopQueriesByPage } from "@/lib/gsc/client";
import { isContentUrl } from "@/lib/engine/url-filter";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Get all active sites
  const { data: sites, error: sitesErr } = await admin
    .from("sites")
    .select("id, gsc_property, gsc_refresh_token")
    .eq("status", "active");

  if (sitesErr || !sites) {
    console.error("[cron/sync-gsc] Failed to fetch sites:", sitesErr);
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 });
  }

  console.log(`[cron/sync-gsc] Syncing ${sites.length} sites`);

  let synced = 0;
  let errors = 0;

  for (const site of sites) {
    try {
      // Refresh access token
      const tokens = await refreshAccessToken(site.gsc_refresh_token);
      const accessToken = tokens.access_token;

      await admin
        .from("sites")
        .update({
          gsc_access_token: accessToken,
          gsc_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        })
        .eq("id", site.id);

      // Pull last 3 days of data (covers any gaps from weekends/delays)
      const now = new Date();
      const startDate = new Date(now.getTime() - 3 * 86400000).toISOString().slice(0, 10);
      const endDate = now.toISOString().slice(0, 10);

      console.log(`[cron/sync-gsc] Site ${site.id}: fetching ${startDate} → ${endDate}`);

      const rows = await getSearchAnalyticsByPageAndDate(accessToken, site.gsc_property, startDate, endDate);

      if (rows.length === 0) {
        console.log(`[cron/sync-gsc] Site ${site.id}: no new data`);
        synced++;
        continue;
      }

      // Upsert new pages
      const { data: existingPages } = await admin
        .from("pages")
        .select("url")
        .eq("site_id", site.id);

      const existingUrls = new Set((existingPages ?? []).map((p) => p.url));
      const newPages: { site_id: string; url: string; path: string; title: string | null }[] = [];

      for (const row of rows) {
        if (!existingUrls.has(row.page) && isContentUrl(row.page)) {
          existingUrls.add(row.page);
          try {
            const url = new URL(row.page);
            newPages.push({ site_id: site.id, url: row.page, path: url.pathname, title: null });
          } catch { /* skip invalid */ }
        }
      }

      if (newPages.length > 0) {
        await admin.from("pages").upsert(newPages, { onConflict: "site_id,url", ignoreDuplicates: true });
        console.log(`[cron/sync-gsc] Site ${site.id}: ${newPages.length} new pages`);
      }

      // Map URLs to IDs
      const { data: dbPages } = await admin.from("pages").select("id, url").eq("site_id", site.id);
      const pageIdMap = new Map((dbPages ?? []).map((p) => [p.url, p.id]));

      // Upsert metrics
      const metrics = rows
        .filter((r) => pageIdMap.has(r.page) && isContentUrl(r.page))
        .map((r) => ({
          page_id: pageIdMap.get(r.page)!,
          date: r.date,
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: r.ctr,
          avg_position: r.position,
        }));

      for (let i = 0; i < metrics.length; i += 1000) {
        const batch = metrics.slice(i, i + 1000);
        await admin.from("page_metrics_daily").upsert(batch, { onConflict: "page_id,date", ignoreDuplicates: false });
      }

      // Sync queries (last 28 days)
      const qStart = new Date(now.getTime() - 28 * 86400000).toISOString().slice(0, 10);
      const queryRows = await getTopQueriesByPage(accessToken, site.gsc_property, qStart, endDate);

      const queries = queryRows
        .filter((r) => pageIdMap.has(r.page))
        .map((r) => ({
          page_id: pageIdMap.get(r.page)!,
          query: r.query,
          date: endDate,
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: r.ctr,
          position: r.position,
        }));

      for (let i = 0; i < queries.length; i += 1000) {
        const batch = queries.slice(i, i + 1000);
        await admin.from("page_queries").upsert(batch, { onConflict: "page_id,query,date", ignoreDuplicates: false });
      }

      // Update site last_sync_at
      await admin
        .from("sites")
        .update({ last_sync_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", site.id);

      synced++;
      console.log(`[cron/sync-gsc] Site ${site.id}: synced ${metrics.length} metrics, ${queries.length} queries`);
    } catch (err) {
      console.error(`[cron/sync-gsc] Site ${site.id} error:`, err);
      errors++;
    }
  }

  console.log(`[cron/sync-gsc] Done. Synced: ${synced}, Errors: ${errors}`);
  return NextResponse.json({ data: { synced, errors, total: sites.length } });
}
