import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getActiveSiteId } from "@/lib/active-site";
import { runDiagnosisPipeline } from "@/lib/ai/pipeline";

/**
 * POST /api/diagnose/auto
 * Retry the free auto-diagnosis if it failed during import.
 * Only runs once per site (has_free_diagnosis = false).
 * Does NOT count against usage limit.
 */
export async function POST() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const activeSiteId = await getActiveSiteId(supabase, user.id);
  if (!activeSiteId) {
    return NextResponse.json({ error: "No active site" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  // Check if free diagnosis already done
  const { data: site } = await admin
    .from("sites")
    .select("id, has_free_diagnosis, status, last_engine_run_at")
    .eq("id", activeSiteId)
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  if (site.has_free_diagnosis) {
    return NextResponse.json({ data: { status: "already_done" } });
  }

  if (site.status !== "active" || !site.last_engine_run_at) {
    return NextResponse.json({ data: { status: "not_ready" } });
  }

  // Pick the best page
  const { data: candidates } = await admin
    .from("pages")
    .select("id, status, decay_score, current_clicks_28d, primary_keyword")
    .eq("site_id", site.id)
    .order("decay_score", { ascending: false })
    .limit(50);

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ data: { status: "no_pages" } });
  }

  const allNew = candidates.every((p) => p.status === "new" || p.status === "unknown");
  let bestPage: typeof candidates[0] | null = null;

  if (allNew) {
    bestPage = [...candidates].sort((a, b) =>
      (b.current_clicks_28d ?? 0) - (a.current_clicks_28d ?? 0),
    )[0] ?? null;
  } else {
    bestPage = candidates.find((p) => p.primary_keyword) ?? candidates[0] ?? null;
  }

  if (!bestPage) {
    return NextResponse.json({ data: { status: "no_candidate" } });
  }

  // Run diagnosis in background (non-blocking response)
  runDiagnosisPipeline(admin, bestPage.id, user.id, "auto")
    .then(async () => {
      await admin
        .from("sites")
        .update({ has_free_diagnosis: true })
        .eq("id", site.id);
      console.log(`[diagnose/auto] Free diagnosis complete for site ${site.id}`);
    })
    .catch((err) => {
      console.error(`[diagnose/auto] Failed for site ${site.id}:`, err);
    });

  return NextResponse.json({ data: { status: "started", pageId: bestPage.id } });
}
