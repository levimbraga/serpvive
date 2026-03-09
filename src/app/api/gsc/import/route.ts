import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getSearchAnalyticsByPageAndDate,
  getTopQueriesByPage,
} from "@/lib/gsc/client";
import { isContentUrl } from "@/lib/engine/url-filter";
import { PLAN_LIMITS, type PlanName } from "@/lib/constants";

const ImportSchema = z.object({
  siteUrl: z.string().min(1),
  domain: z.string().min(1),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("gsc_access_token")?.value;
  const refreshToken = cookieStore.get("gsc_refresh_token")?.value;

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "GSC not connected" }, { status: 403 });
  }

  const body = (await request.json()) as unknown;
  const parsed = ImportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { siteUrl, domain } = parsed.data;

  // Check plan site limit
  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan ?? "trial") as PlanName;
  const siteLimit = PLAN_LIMITS[plan].sites;

  const { count: currentSites } = await admin
    .from("sites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((currentSites ?? 0) >= siteLimit) {
    return NextResponse.json(
      { error: `Your ${plan} plan allows ${siteLimit} site${siteLimit > 1 ? "s" : ""}. Upgrade to add more.` },
      { status: 403 },
    );
  }

  // Create the site record
  const { data: site, error: siteError } = await admin
    .from("sites")
    .insert({
      user_id: user.id,
      domain,
      gsc_property: siteUrl,
      gsc_refresh_token: refreshToken,
      gsc_access_token: accessToken,
      gsc_token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
      status: "importing",
    })
    .select("id")
    .single();

  if (siteError) {
    if (siteError.code === "23505") {
      return NextResponse.json({ error: "This site is already connected." }, { status: 409 });
    }
    console.error("[gsc/import] Site insert error:", siteError);
    return NextResponse.json({ error: "Failed to create site" }, { status: 500 });
  }

  // Start import in background (non-blocking)
  runImport(admin, site.id, accessToken, siteUrl).catch((err) => {
    console.error("[gsc/import] Background import failed:", err);
  });

  // Clear temporary cookies
  const response = NextResponse.json({ data: { siteId: site.id } });
  response.cookies.delete("gsc_access_token");
  response.cookies.delete("gsc_refresh_token");

  return response;
}

// ── Background Import ──

async function runImport(
  admin: ReturnType<typeof getSupabaseAdmin>,
  siteId: string,
  accessToken: string,
  siteUrl: string,
) {
  try {
    // Import 16 months of daily data in chunks (per month)
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
        console.log(`[gsc/import] Fetching ${start} → ${end}...`);
        const rows = await getSearchAnalyticsByPageAndDate(accessToken, siteUrl, start, end);
        console.log(`[gsc/import] Got ${rows.length} rows for ${start} → ${end}`);

        if (rows.length === 0) continue;

        // Collect new pages from this batch (filtered)
        const newPages: { site_id: string; url: string; path: string; title: string | null }[] = [];
        for (const row of rows) {
          if (!knownPages.has(row.page) && isContentUrl(row.page)) {
            knownPages.add(row.page);
            try {
              const url = new URL(row.page);
              newPages.push({
                site_id: siteId,
                url: row.page,
                path: url.pathname,
                title: null,
              });
            } catch {
              // Invalid URL, skip
            }
          }
        }

        // Upsert any new pages found in this month
        if (newPages.length > 0) {
          console.log(`[gsc/import] Upserting ${newPages.length} new pages`);
          const { error: pageErr } = await admin.from("pages").upsert(newPages, {
            onConflict: "site_id,url",
            ignoreDuplicates: true,
          });
          if (pageErr) console.error("[gsc/import] Page upsert error:", pageErr);
        }

        // Get page IDs for mapping
        const { data: dbPages } = await admin
          .from("pages")
          .select("id, url")
          .eq("site_id", siteId);

        const pageIdMap = new Map((dbPages ?? []).map((p) => [p.url, p.id]));

        // Insert daily metrics (only for content pages)
        const metricsToInsert = rows
          .filter((row) => pageIdMap.has(row.page) && isContentUrl(row.page))
          .map((row) => ({
            page_id: pageIdMap.get(row.page)!,
            date: row.date,
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
            avg_position: row.position,
          }));

        if (metricsToInsert.length > 0) {
          for (let i = 0; i < metricsToInsert.length; i += 1000) {
            const batch = metricsToInsert.slice(i, i + 1000);
            const { error: metricErr } = await admin.from("page_metrics_daily").upsert(batch, {
              onConflict: "page_id,date",
              ignoreDuplicates: true,
            });
            if (metricErr) console.error("[gsc/import] Metric upsert error:", metricErr);
          }
          totalMetrics += metricsToInsert.length;
        }

        // Update progress
        await admin
          .from("sites")
          .update({
            pages_count: knownPages.size,
            updated_at: new Date().toISOString(),
          })
          .eq("id", siteId);

        console.log(`[gsc/import] Progress: ${knownPages.size} pages, ${totalMetrics} metrics`);
      } catch (err) {
        console.error(`[gsc/import] Error importing ${start} - ${end}:`, err);
      }
    }

    // Import top queries (last 28 days)
    try {
      const qStart = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const qEnd = now.toISOString().slice(0, 10);
      console.log(`[gsc/import] Fetching queries ${qStart} → ${qEnd}...`);
      const queryRows = await getTopQueriesByPage(accessToken, siteUrl, qStart, qEnd);
      console.log(`[gsc/import] Got ${queryRows.length} query rows`);

      const { data: dbPages } = await admin
        .from("pages")
        .select("id, url")
        .eq("site_id", siteId);

      const pageIdMap = new Map((dbPages ?? []).map((p) => [p.url, p.id]));

      const queriesToInsert = queryRows
        .filter((row) => pageIdMap.has(row.page))
        .map((row) => ({
          page_id: pageIdMap.get(row.page)!,
          query: row.query,
          date: qEnd,
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        }));

      for (let i = 0; i < queriesToInsert.length; i += 1000) {
        const batch = queriesToInsert.slice(i, i + 1000);
        const { error: queryErr } = await admin.from("page_queries").upsert(batch, {
          onConflict: "page_id,query,date",
          ignoreDuplicates: true,
        });
        if (queryErr) console.error("[gsc/import] Query upsert error:", queryErr);
      }
    } catch (err) {
      console.error("[gsc/import] Query import error:", err);
    }

    // Mark site as active
    await admin
      .from("sites")
      .update({
        status: "active",
        pages_count: knownPages.size,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", siteId);

    console.log(`[gsc/import] Done! ${knownPages.size} pages, ${totalMetrics} metrics`);
  } catch (err) {
    console.error("[gsc/import] Fatal import error:", err);
    await admin
      .from("sites")
      .update({ status: "error", updated_at: new Date().toISOString() })
      .eq("id", siteId);
  }
}
