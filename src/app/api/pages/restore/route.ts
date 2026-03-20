import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { recalcSiteCounts } from "@/lib/engine/recalc-counts";

const RestoreSchema = z.object({
  pageId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = RestoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input: pageId required" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  const { data: page } = await admin
    .from("pages")
    .select("id, site_id, status")
    .eq("id", parsed.data.pageId)
    .single();

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const { data: site } = await admin
    .from("sites")
    .select("user_id")
    .eq("id", page.site_id)
    .single();

  if (!site || site.user_id !== user.id) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  if (page.status !== "excluded") {
    return NextResponse.json({ error: "Page is not excluded" }, { status: 400 });
  }

  // Restore to 'unknown' — the engine will reclassify on next run
  await admin
    .from("pages")
    .update({ status: "unknown", updated_at: new Date().toISOString() })
    .eq("id", page.id);

  await recalcSiteCounts(admin, page.site_id);

  return NextResponse.json({ data: { success: true } });
}
