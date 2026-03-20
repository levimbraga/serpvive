import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { recalcSiteCounts } from "@/lib/engine/recalc-counts";

const BulkExcludeSchema = z.object({
  pageIds: z.array(z.string().uuid()).min(1).max(500),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = BulkExcludeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input: pageIds array required" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  // Verify all pages belong to user (via site ownership)
  const { data: pages } = await admin
    .from("pages")
    .select("id, site_id, status")
    .in("id", parsed.data.pageIds);

  if (!pages || pages.length === 0) {
    return NextResponse.json({ error: "No valid pages found" }, { status: 404 });
  }

  // Get unique site IDs and verify ownership
  const siteIds = [...new Set(pages.map((p) => p.site_id))];

  const { data: sites } = await admin
    .from("sites")
    .select("id, user_id")
    .in("id", siteIds);

  const ownedSiteIds = new Set(
    (sites ?? []).filter((s) => s.user_id === user.id).map((s) => s.id),
  );

  // Filter to only pages the user owns and that aren't already excluded/redirected
  const validPageIds = pages
    .filter((p) => ownedSiteIds.has(p.site_id) && p.status !== "excluded" && p.status !== "redirected")
    .map((p) => p.id);

  if (validPageIds.length === 0) {
    return NextResponse.json({ error: "No eligible pages to exclude" }, { status: 400 });
  }

  // Bulk update
  await admin
    .from("pages")
    .update({ status: "excluded", updated_at: new Date().toISOString() })
    .in("id", validPageIds);

  // Recalculate counts for all affected sites
  for (const siteId of ownedSiteIds) {
    await recalcSiteCounts(admin, siteId);
  }

  return NextResponse.json({ data: { excluded: validPageIds.length } });
}
