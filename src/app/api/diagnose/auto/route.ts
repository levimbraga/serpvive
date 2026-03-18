import { NextResponse, after } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getActiveSiteId } from "@/lib/active-site";
import { runDiagnosisPipeline } from "@/lib/ai/pipeline";

const TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes
const STALE_MS = 5 * 60 * 1000; // 5 minutes — treat as failed

/**
 * POST /api/diagnose/auto
 * Triggers or retries the free auto-diagnosis.
 * Uses sites.auto_diagnosis_status as persistent state machine:
 *   pending → diagnosing → completed | failed
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

  const { data: site } = await admin
    .from("sites")
    .select("id, has_free_diagnosis, auto_diagnosis_status, status, last_engine_run_at, updated_at")
    .eq("id", activeSiteId)
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Already completed — return existing diagnosis
  if (site.auto_diagnosis_status === "completed" && site.has_free_diagnosis) {
    const { data: existingDiag } = await admin
      .from("diagnoses")
      .select("id, page_id")
      .eq("user_id", user.id)
      .eq("triggered_by", "auto")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      data: { status: "completed", pageId: existingDiag?.page_id ?? null },
    });
  }

  // Currently processing — check for timeout
  if (site.auto_diagnosis_status === "diagnosing") {
    const startedAt = new Date(site.updated_at).getTime();
    const elapsed = Date.now() - startedAt;

    if (elapsed < STALE_MS) {
      return NextResponse.json({ data: { status: "diagnosing" } });
    }

    // Stale (>5 min) — treat as failed
    console.warn(`[diagnose/auto] Stale diagnosing state for site ${site.id}, resetting to failed`);
    await admin
      .from("sites")
      .update({ auto_diagnosis_status: "failed", has_free_diagnosis: false, updated_at: new Date().toISOString() })
      .eq("id", site.id);

    return NextResponse.json({ data: { status: "failed" } });
  }

  // Failed — don't auto-retry, let user use manual
  if (site.auto_diagnosis_status === "failed") {
    return NextResponse.json({ data: { status: "failed" } });
  }

  // Engine must have run first
  if (site.status !== "active" || !site.last_engine_run_at) {
    return NextResponse.json({ data: { status: "not_ready" } });
  }

  // Check if diagnosis already exists (edge case: completed but status not updated)
  const { data: existingAuto } = await admin
    .from("diagnoses")
    .select("id, page_id")
    .eq("user_id", user.id)
    .eq("triggered_by", "auto")
    .limit(1)
    .maybeSingle();

  if (existingAuto) {
    await admin
      .from("sites")
      .update({ auto_diagnosis_status: "completed", has_free_diagnosis: true, updated_at: new Date().toISOString() })
      .eq("id", site.id);
    return NextResponse.json({ data: { status: "completed", pageId: existingAuto.page_id } });
  }

  // Pick the best page
  const { data: candidates } = await admin
    .from("pages")
    .select("id, status, decay_score, current_clicks_28d, primary_keyword")
    .eq("site_id", site.id)
    .order("decay_score", { ascending: false })
    .limit(50);

  if (!candidates || candidates.length === 0) {
    await admin
      .from("sites")
      .update({ auto_diagnosis_status: "failed", updated_at: new Date().toISOString() })
      .eq("id", site.id);
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
    await admin
      .from("sites")
      .update({ auto_diagnosis_status: "failed", updated_at: new Date().toISOString() })
      .eq("id", site.id);
    return NextResponse.json({ data: { status: "no_candidate" } });
  }

  // Transition to 'diagnosing' — prevents duplicate runs
  await admin
    .from("sites")
    .update({
      auto_diagnosis_status: "diagnosing",
      has_free_diagnosis: true, // optimistic lock
      updated_at: new Date().toISOString(),
    })
    .eq("id", site.id);

  // Run pipeline in background
  after(async () => {
    try {
      console.log(`[diagnose/auto] Starting pipeline for site ${site.id}, page ${bestPage!.id}`);
      const pipeline = runDiagnosisPipeline(admin, bestPage!.id, user!.id, "auto");
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Auto-diagnosis timed out")), TIMEOUT_MS),
      );
      await Promise.race([pipeline, timeout]);

      await admin
        .from("sites")
        .update({ auto_diagnosis_status: "completed", has_free_diagnosis: true, updated_at: new Date().toISOString() })
        .eq("id", site.id);
      console.log(`[diagnose/auto] Complete for site ${site.id}`);
    } catch (err) {
      console.error(`[diagnose/auto] Failed for site ${site.id}:`, err);
      await admin
        .from("sites")
        .update({ auto_diagnosis_status: "failed", has_free_diagnosis: false, updated_at: new Date().toISOString() })
        .eq("id", site.id);
    }
  });

  return NextResponse.json({ data: { status: "diagnosing", pageId: bestPage.id } });
}
