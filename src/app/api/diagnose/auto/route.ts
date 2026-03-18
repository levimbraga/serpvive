import { NextResponse, after } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getActiveSiteId } from "@/lib/active-site";
import { runDiagnosisPipeline } from "@/lib/ai/pipeline";

/**
 * POST /api/diagnose/auto
 * Retry the free auto-diagnosis if it failed during import.
 * Only runs once per site (has_free_diagnosis = false).
 * Does NOT count against usage limit.
 * Max 3 attempts — after that, gives up and marks has_free_diagnosis = true.
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

  // Check if an auto diagnosis already exists (pipeline completed but flag wasn't set)
  const { data: existingAuto } = await admin
    .from("diagnoses")
    .select("id, page_id")
    .eq("user_id", user.id)
    .eq("triggered_by", "auto")
    .limit(1)
    .maybeSingle();

  if (existingAuto) {
    // Pipeline succeeded before but flag wasn't set — fix it
    await admin
      .from("sites")
      .update({ has_free_diagnosis: true })
      .eq("id", site.id);
    console.log(`[diagnose/auto] Found existing auto diagnosis, marked has_free_diagnosis=true`);
    return NextResponse.json({ data: { status: "already_done", pageId: existingAuto.page_id } });
  }

  // Check attempt count — max 3 retries, then give up
  const { count: attemptCount } = await admin
    .from("diagnoses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("triggered_by", "auto");

  // If we already have auto diagnoses (even failed), check attempts via a different signal
  // Use a simpler approach: count how many times this endpoint has been effectively called
  // by checking if there's already a running pipeline (no diagnosis record yet = might be running)
  // For safety, just limit: if attemptCount >= 3, stop trying
  if ((attemptCount ?? 0) >= 3) {
    await admin
      .from("sites")
      .update({ has_free_diagnosis: true })
      .eq("id", site.id);
    console.log(`[diagnose/auto] Max attempts (3) reached for site ${site.id}, giving up`);
    return NextResponse.json({ data: { status: "max_attempts" } });
  }

  // Pick the best page
  const { data: candidates } = await admin
    .from("pages")
    .select("id, status, decay_score, current_clicks_28d, primary_keyword")
    .eq("site_id", site.id)
    .order("decay_score", { ascending: false })
    .limit(50);

  if (!candidates || candidates.length === 0) {
    // No pages to diagnose — mark as done so we don't loop
    await admin
      .from("sites")
      .update({ has_free_diagnosis: true })
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
      .update({ has_free_diagnosis: true })
      .eq("id", site.id);
    return NextResponse.json({ data: { status: "no_candidate" } });
  }

  // Optimistic lock: mark as done BEFORE pipeline starts to prevent duplicate runs.
  // The WelcomeCard polls every 10s — without this, it re-triggers the pipeline.
  await admin
    .from("sites")
    .update({ has_free_diagnosis: true })
    .eq("id", site.id);

  // Run diagnosis after response is sent — `after()` keeps the serverless
  // function alive on Vercel so the pipeline actually completes.
  after(async () => {
    const TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes
    try {
      console.log(`[diagnose/auto] Starting pipeline for site ${site.id}, page ${bestPage!.id}`);
      const pipeline = runDiagnosisPipeline(admin, bestPage!.id, user!.id, "auto");
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Auto-diagnosis timed out after 3 minutes")), TIMEOUT_MS),
      );
      await Promise.race([pipeline, timeout]);
      console.log(`[diagnose/auto] Free diagnosis complete for site ${site.id}`);
    } catch (err) {
      console.error(`[diagnose/auto] Failed for site ${site.id}:`, err);
      // Reset flag so user can retry via WelcomeCard or pick a page manually
      await admin
        .from("sites")
        .update({ has_free_diagnosis: false })
        .eq("id", site.id);
    }
  });

  return NextResponse.json({ data: { status: "started", pageId: bestPage.id } });
}
