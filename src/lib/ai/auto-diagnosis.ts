import type { SupabaseClient } from "@supabase/supabase-js";
import { runDiagnosisPipeline } from "./pipeline";
import { sendAutoDiagnosisReady } from "@/lib/email/send";

const TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

/**
 * Run auto-diagnosis for a site (server-side, fully synchronous).
 * Safe to call multiple times — the state machine prevents duplicates.
 * Does NOT use after() — the caller is responsible for backgrounding.
 */
export async function runServerAutoDiagnosis(
  admin: SupabaseClient,
  siteId: string,
  userId: string,
): Promise<{ status: string; pageId?: string }> {
  const { data: site } = await admin
    .from("sites")
    .select("id, has_free_diagnosis, auto_diagnosis_status, last_engine_run_at")
    .eq("id", siteId)
    .single();

  if (!site) return { status: "not_found" };
  if (site.auto_diagnosis_status !== "pending") return { status: site.auto_diagnosis_status };
  if (!site.last_engine_run_at) return { status: "not_ready" };

  // One free diagnosis per user — check if already used on another site
  const { data: otherSiteWithFreeDiag } = await admin
    .from("sites")
    .select("id")
    .eq("user_id", userId)
    .eq("has_free_diagnosis", true)
    .neq("id", siteId)
    .limit(1)
    .maybeSingle();

  if (otherSiteWithFreeDiag) {
    return { status: "skipped" };
  }

  // Check for existing auto diagnosis (edge case: completed but status not updated)
  const { data: existingAuto } = await admin
    .from("diagnoses")
    .select("id, page_id")
    .eq("user_id", userId)
    .eq("triggered_by", "auto")
    .limit(1)
    .maybeSingle();

  if (existingAuto) {
    await admin
      .from("sites")
      .update({ auto_diagnosis_status: "completed", has_free_diagnosis: true, updated_at: new Date().toISOString() })
      .eq("id", siteId);
    return { status: "completed", pageId: existingAuto.page_id };
  }

  // Pick best page: highest decay score (or highest clicks if all pages are new)
  const { data: candidates } = await admin
    .from("pages")
    .select("id, status, decay_score, current_clicks_28d, primary_keyword")
    .eq("site_id", siteId)
    .order("decay_score", { ascending: false })
    .limit(50);

  if (!candidates?.length) {
    await admin.from("sites").update({ auto_diagnosis_status: "failed", updated_at: new Date().toISOString() }).eq("id", siteId);
    return { status: "no_pages" };
  }

  const allNew = candidates.every((p) => p.status === "new" || p.status === "unknown");
  const bestPage = allNew
    ? [...candidates].sort((a, b) => (b.current_clicks_28d ?? 0) - (a.current_clicks_28d ?? 0))[0]
    : (candidates.find((p) => p.primary_keyword) ?? candidates[0]);

  if (!bestPage) {
    await admin.from("sites").update({ auto_diagnosis_status: "failed", updated_at: new Date().toISOString() }).eq("id", siteId);
    return { status: "no_candidate" };
  }

  // Transition to diagnosing — prevents duplicate runs
  await admin.from("sites").update({
    auto_diagnosis_status: "diagnosing",
    has_free_diagnosis: true,
    updated_at: new Date().toISOString(),
  }).eq("id", siteId);

  // Run pipeline with timeout
  try {
    console.log(`[auto-diagnosis] Starting for site ${siteId}, page ${bestPage.id}`);
    const pipeline = runDiagnosisPipeline(admin, bestPage.id, userId, "auto");
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Auto-diagnosis timed out")), TIMEOUT_MS),
    );
    await Promise.race([pipeline, timeout]);

    await admin.from("sites").update({
      auto_diagnosis_status: "completed",
      has_free_diagnosis: true,
      updated_at: new Date().toISOString(),
    }).eq("id", siteId);

    // Send "Your first AI analysis is ready" email (fire-and-forget)
    sendAutoDiagnosisReady(userId, bestPage.id).catch((emailErr) => {
      console.error("[auto-diagnosis] Email send failed:", emailErr);
    });

    console.log(`[auto-diagnosis] Complete for site ${siteId}`);
    return { status: "completed", pageId: bestPage.id };
  } catch (err) {
    console.error(`[auto-diagnosis] Failed for site ${siteId}:`, err);
    await admin.from("sites").update({
      auto_diagnosis_status: "failed",
      has_free_diagnosis: false,
      updated_at: new Date().toISOString(),
    }).eq("id", siteId);
    return { status: "failed" };
  }
}
