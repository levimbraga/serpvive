import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PLAN_LIMITS } from "@/lib/constants";
import type { PlanName } from "@/lib/constants";

const AddPageSchema = z.object({
  siteId: z.string().uuid(),
  url: z.string().url().max(2048),
  title: z.string().max(500).optional(),
  primaryKeyword: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = AddPageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input. A valid URL is required." }, { status: 400 });
  }

  const { siteId, url, title, primaryKeyword } = parsed.data;
  const admin = getSupabaseAdmin();

  // Verify site ownership
  const { data: site } = await admin
    .from("sites")
    .select("id, user_id, domain")
    .eq("id", siteId)
    .single();

  if (!site || site.user_id !== user.id) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Validate URL belongs to site domain
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  const urlDomain = parsedUrl.hostname.replace(/^www\./, "");
  const siteDomain = site.domain.replace(/^www\./, "");

  if (urlDomain !== siteDomain) {
    return NextResponse.json(
      { error: `URL must belong to ${site.domain}` },
      { status: 400 },
    );
  }

  // Check plan page limits
  const { data: profile } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = (profile?.plan ?? "free") as PlanName;
  const pageLimit = PLAN_LIMITS[plan]?.pages ?? 100;

  const { count: currentCount } = await admin
    .from("pages")
    .select("id", { count: "exact", head: true })
    .eq("site_id", siteId)
    .neq("status", "redirected")
    .neq("status", "excluded");

  if ((currentCount ?? 0) >= pageLimit) {
    return NextResponse.json(
      { error: `Page limit reached (${pageLimit}). Upgrade your plan to add more pages.` },
      { status: 403 },
    );
  }

  // Check for duplicate URL
  const normalizedUrl = url.replace(/\/$/, ""); // strip trailing slash
  const { data: existing } = await admin
    .from("pages")
    .select("id")
    .eq("site_id", siteId)
    .or(`url.eq.${normalizedUrl},url.eq.${normalizedUrl}/`)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "This page is already being monitored" },
      { status: 409 },
    );
  }

  // Extract path from URL
  const path = parsedUrl.pathname || "/";

  // Insert page
  const { data: newPage, error: insertErr } = await admin
    .from("pages")
    .insert({
      site_id: siteId,
      url: normalizedUrl,
      path,
      title: title || null,
      primary_keyword: primaryKeyword || null,
      keyword_source: primaryKeyword ? "url" : null,
      status: "new",
      current_clicks_28d: 0,
      current_impressions_28d: 0,
      current_ctr: 0,
      current_avg_position: 0,
      peak_clicks_monthly: 0,
      decay_score: 0,
      decay_velocity_7d: 0,
      decay_velocity_28d: 0,
      is_seasonal: false,
    })
    .select("id, url, path, status")
    .single();

  if (insertErr) {
    if (insertErr.code === "23505") {
      return NextResponse.json({ error: "This page is already being monitored" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to add page" }, { status: 500 });
  }

  return NextResponse.json({ data: newPage });
}
