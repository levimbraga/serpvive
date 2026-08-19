import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { refreshAccessToken, getSearchAnalyticsByPageAndDate, getTopQueriesByPage } from "@/lib/gsc/client";

export const maxDuration = 300; // 5 minutes
import { isContentUrl } from "@/lib/engine/url-filter";
import { PLAN_LIMITS, type PlanName } from "@/lib/constants";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Get all active sites with user profile info
  const { data: sites, error: sitesErr } = await admin
    .from("sites")
    .select("id, user_id, gsc_property, gsc_refresh_token, last_sync_at, status")
    .eq("status", "active");

  if (sitesErr || !sites) {
    console.error("[cron/sync-gsc] Failed to fetch sites:", sitesErr);
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 });
  }

  console.log(`[cron/sync-gsc] Found ${sites.length} active sites`);

  let synced = 0;
  let skipped = 0;
  let errors = 0;

  for (const site of sites) {
    try {
      // Get user profile to check plan
      const { data: profile } = await admin
        .from("profiles")
        .select("plan, free_since")
        .eq("id", site.user_id)
        .single();

      const plan = (profile?.plan ?? "free") as PlanName;

      // ── Free plan cadence ──
      if (plan === "free") {
        // DISABLED in the public version: the 90-day freeze existed as a
        // cost backstop for abandoned free accounts on the path to a paid
        // tier. With payments disabled there is no tier to migrate to, so
        // freezing would just dead-end every account. The mechanism is kept
        // (commented) because it worked as designed in production.
        //
        // if (profile?.free_since) {
        //   const daysFree = (Date.now() - new Date(profile.free_since).getTime()) / (1000 * 60 * 60 * 24);
        //   if (daysFree >= 90) {
        //     console.log(`[cron/sync-gsc] Site ${site.id}: frozen (${Math.floor(daysFree)} days on free)`);
        //     if (site.status !== "paused") {
        //       await admin.from("sites").update({ status: "paused" }).eq("id", site.id);
        //     }
        //     skipped++;
        //     continue;
        //   }
        // }

        // Weekly sync cadence STAYS for free accounts — this is a deliberate
        // cost control (GSC API quota + processing), independent of the freeze.
        if (site.last_sync_at) {
          const daysSinceSync = (Date.now() - new Date(site.last_sync_at).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceSync < 7) {
            console.log(`[cron/sync-gsc] Site ${site.id}: free plan, last sync ${daysSinceSync.toFixed(1)}d ago, skipping`);
            skipped++;
            continue;
          }
        }
      }

      // Refresh access token
      let accessToken: string;
      try {
        const tokens = await refreshAccessToken(site.gsc_refresh_token);
        accessToken = tokens.access_token;

        await admin
          .from("sites")
          .update({
            gsc_access_token: accessToken,
            gsc_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
            token_error: false,
          })
          .eq("id", site.id);
      } catch (tokenErr) {
        console.error(`[cron/sync-gsc] Site ${site.id}: token refresh failed — marking token_error`, tokenErr);
        await admin
          .from("sites")
          .update({ token_error: true })
          .eq("id", site.id);
        errors++;
        continue;
      }

      // Pull last 3 days of data (covers any gaps from weekends/delays)
      const now = new Date();
      const startDate = new Date(now.getTime() - 3 * 86400000).toISOString().slice(0, 10);
      const endDate = now.toISOString().slice(0, 10);

      console.log(`[cron/sync-gsc] Site ${site.id}: fetching ${startDate} → ${endDate}`);

      const rows = await getSearchAnalyticsByPageAndDate(accessToken, site.gsc_property, startDate, endDate);

      console.log(`[cron/sync-gsc] Site ${site.id}: GSC returned ${rows.length} rows`);

      if (rows.length === 0) {
        console.log(`[cron/sync-gsc] Site ${site.id}: no new data from GSC for ${startDate} → ${endDate}`);
        await admin
          .from("sites")
          .update({ last_sync_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", site.id);
        synced++;
        continue;
      }

      // Check plan page limit before adding new pages
      const pageLimit = PLAN_LIMITS[plan].pages;

      // Upsert new pages (only if under limit)
      const { data: existingPages } = await admin
        .from("pages")
        .select("url")
        .eq("site_id", site.id)
        .neq("status", "redirected");

      const existingUrls = new Set((existingPages ?? []).map((p) => p.url));
      const currentPageCount = existingUrls.size;
      const slotsAvailable = Math.max(0, pageLimit - currentPageCount);

      // Detailed URL analysis for debugging
      const allUniqueUrls = [...new Set(rows.map((r) => r.page))];
      const urlAnalysis = {
        total_from_gsc: allUniqueUrls.length,
        already_tracked: 0,
        filtered_by_url_filter: [] as string[],
        new_content_pages: 0,
        invalid_urls: [] as string[],
      };

      const newPages: { site_id: string; url: string; path: string; title: string | null }[] = [];

      for (const row of rows) {
        if (existingUrls.has(row.page)) {
          // Already tracked — skip but don't re-log
          continue;
        }

        if (!isContentUrl(row.page)) {
          // Track which URLs got filtered and why
          if (!urlAnalysis.filtered_by_url_filter.includes(row.page)) {
            urlAnalysis.filtered_by_url_filter.push(row.page);
          }
          continue;
        }

        // New content page
        existingUrls.add(row.page);
        try {
          const url = new URL(row.page);
          newPages.push({ site_id: site.id, url: row.page, path: url.pathname, title: null });
        } catch {
          urlAnalysis.invalid_urls.push(row.page);
        }
      }

      urlAnalysis.already_tracked = currentPageCount;
      urlAnalysis.new_content_pages = newPages.length;

      console.log(`[cron/sync-gsc] Site ${site.id} URL analysis:`, {
        total_from_gsc: urlAnalysis.total_from_gsc,
        already_tracked: urlAnalysis.already_tracked,
        filtered_out: urlAnalysis.filtered_by_url_filter.length,
        new_pages: urlAnalysis.new_content_pages,
        invalid: urlAnalysis.invalid_urls.length,
        slots_available: slotsAvailable,
      });

      if (urlAnalysis.filtered_by_url_filter.length > 0) {
        console.log(`[cron/sync-gsc] Site ${site.id} filtered URLs (first 10):`,
          urlAnalysis.filtered_by_url_filter.slice(0, 10));
      }

      if (urlAnalysis.invalid_urls.length > 0) {
        console.log(`[cron/sync-gsc] Site ${site.id} invalid URLs:`, urlAnalysis.invalid_urls);
      }

      if (newPages.length > 0 && slotsAvailable > 0) {
        // Sort new pages by clicks (highest traffic first) to prioritize valuable content
        const clicksMap = new Map<string, number>();
        for (const row of rows) {
          clicksMap.set(row.page, (clicksMap.get(row.page) ?? 0) + row.clicks);
        }
        newPages.sort((a, b) => (clicksMap.get(b.url) ?? 0) - (clicksMap.get(a.url) ?? 0));

        const pagesToAdd = newPages.slice(0, slotsAvailable);
        await admin.from("pages").upsert(pagesToAdd, { onConflict: "site_id,url", ignoreDuplicates: true });
        console.log(`[cron/sync-gsc] Site ${site.id}: ${pagesToAdd.length} new pages added (${newPages.length - pagesToAdd.length} skipped, limit ${pageLimit})`);
      } else if (newPages.length > 0) {
        console.log(`[cron/sync-gsc] Site ${site.id}: skipped ${newPages.length} new pages (at limit ${pageLimit})`);
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

  console.log(`[cron/sync-gsc] Done. Synced: ${synced}, Skipped: ${skipped}, Errors: ${errors}`);
  return NextResponse.json({ data: { synced, skipped, errors, total: sites.length } });
}
