import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { refreshAccessToken } from "@/lib/gsc/client";
import {
  getSearchAnalyticsByPageAndDate,
  getTopQueriesByPage,
} from "@/lib/gsc/client";
import { isContentUrl } from "@/lib/engine/url-filter";

export async function POST() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Get user's site with refresh token
  const { data: site, error: siteErr } = await admin
    .from("sites")
    .select("id, gsc_property, gsc_refresh_token")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (siteErr || !site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  // Get fresh access token
  let accessToken: string;
  try {
    const tokens = await refreshAccessToken(site.gsc_refresh_token);
    accessToken = tokens.access_token;

    // Update stored token
    await admin
      .from("sites")
      .update({
        gsc_access_token: accessToken,
        gsc_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      })
      .eq("id", site.id);
  } catch (err) {
    console.error("[gsc/reimport] Token refresh failed:", err);
    return NextResponse.json({ error: "Failed to refresh GSC token. Reconnect GSC." }, { status: 403 });
  }

  // Set to importing
  await admin
    .from("sites")
    .update({ status: "importing", updated_at: new Date().toISOString() })
    .eq("id", site.id);

  // Run import in background
  runReimport(admin, site.id, accessToken, site.gsc_property).catch((err) => {
    console.error("[gsc/reimport] Failed:", err);
  });

  return NextResponse.json({ data: { siteId: site.id, status: "reimporting" } });
}

async function runReimport(
  admin: ReturnType<typeof getSupabaseAdmin>,
  siteId: string,
  accessToken: string,
  siteUrl: string,
) {
  try {
    const now = new Date();
    const months: { start: string; end: string }[] = [];

    for (let i = 16; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = d.toISOString().slice(0, 10);
      const endD = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const end = endD > now ? now.toISOString().slice(0, 10) : endD.toISOString().slice(0, 10);
      if (start < end) months.push({ start, end });
    }

    const knownPages = new Set<string>();
    let totalMetrics = 0;

    for (const { start, end } of months) {
      try {
        console.log(`[gsc/reimport] Fetching ${start} → ${end}...`);
        const rows = await getSearchAnalyticsByPageAndDate(accessToken, siteUrl, start, end);
        console.log(`[gsc/reimport] Got ${rows.length} rows`);

        if (rows.length === 0) continue;

        // Collect new pages
        const newPages: { site_id: string; url: string; path: string; title: string | null }[] = [];
        for (const row of rows) {
          if (!knownPages.has(row.page) && isContentUrl(row.page)) {
            knownPages.add(row.page);
            try {
              const url = new URL(row.page);
              newPages.push({ site_id: siteId, url: row.page, path: url.pathname, title: null });
            } catch { /* skip invalid URLs */ }
          }
        }

        if (newPages.length > 0) {
          const { error: pageErr } = await admin.from("pages").upsert(newPages, {
            onConflict: "site_id,url",
            ignoreDuplicates: true,
          });
          if (pageErr) console.error("[gsc/reimport] Page upsert error:", pageErr);
        }

        // Map page URLs → IDs
        const { data: dbPages } = await admin
          .from("pages")
          .select("id, url")
          .eq("site_id", siteId);
        const pageIdMap = new Map((dbPages ?? []).map((p) => [p.url, p.id]));

        // Insert metrics
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
          const { error } = await admin.from("page_metrics_daily").upsert(batch, {
            onConflict: "page_id,date",
            ignoreDuplicates: true,
          });
          if (error) console.error("[gsc/reimport] Metric error:", error);
        }
        totalMetrics += metrics.length;

        await admin
          .from("sites")
          .update({ pages_count: knownPages.size, updated_at: new Date().toISOString() })
          .eq("id", siteId);

        console.log(`[gsc/reimport] Progress: ${knownPages.size} pages, ${totalMetrics} metrics`);
      } catch (err) {
        console.error(`[gsc/reimport] Error ${start}-${end}:`, err);
      }
    }

    // Queries (last 28 days)
    try {
      const qStart = new Date(now.getTime() - 28 * 86400000).toISOString().slice(0, 10);
      const qEnd = now.toISOString().slice(0, 10);
      const queryRows = await getTopQueriesByPage(accessToken, siteUrl, qStart, qEnd);
      console.log(`[gsc/reimport] Got ${queryRows.length} query rows`);

      const { data: dbPages } = await admin.from("pages").select("id, url").eq("site_id", siteId);
      const pageIdMap = new Map((dbPages ?? []).map((p) => [p.url, p.id]));

      const queries = queryRows
        .filter((r) => pageIdMap.has(r.page))
        .map((r) => ({
          page_id: pageIdMap.get(r.page)!,
          query: r.query,
          date: qEnd,
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: r.ctr,
          position: r.position,
        }));

      for (let i = 0; i < queries.length; i += 1000) {
        const batch = queries.slice(i, i + 1000);
        await admin.from("page_queries").upsert(batch, {
          onConflict: "page_id,query,date",
          ignoreDuplicates: true,
        });
      }
    } catch (err) {
      console.error("[gsc/reimport] Query error:", err);
    }

    await admin
      .from("sites")
      .update({
        status: "active",
        pages_count: knownPages.size,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", siteId);

    console.log(`[gsc/reimport] Done! ${knownPages.size} pages, ${totalMetrics} metrics`);
  } catch (err) {
    console.error("[gsc/reimport] Fatal:", err);
    await admin
      .from("sites")
      .update({ status: "error", updated_at: new Date().toISOString() })
      .eq("id", siteId);
  }
}
