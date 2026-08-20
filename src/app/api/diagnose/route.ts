import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";

export const maxDuration = 300; // 5 minutes
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PLAN_LIMITS, RATE_LIMITS_PER_HOUR, FREE_LIFETIME_ANALYSES, isAdmin } from "@/lib/constants";
import { countFreeAnalysesUsed } from "@/lib/limits";
import type { PlanName } from "@/lib/constants";
import { runDiagnosisPipeline } from "@/lib/ai/pipeline";
import { checkRateLimit } from "@/lib/rate-limit";
import { getPostHogServer } from "@/lib/posthog/server";

const DiagnoseInputSchema = z.object({
  pageId: z.string().uuid(),
  keywordOverride: z.string().min(2).max(200).optional(),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate input
  const body = (await request.json()) as unknown;
  const parsed = DiagnoseInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input: pageId required" }, { status: 400 });
  }

  const { pageId } = parsed.data;
  const admin = getSupabaseAdmin();

  // Verify page belongs to user
  const { data: page } = await admin
    .from("pages")
    .select("id, site_id")
    .eq("id", pageId)
    .single();

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const { data: site } = await admin
    .from("sites")
    .select("user_id, has_free_diagnosis")
    .eq("id", page.site_id)
    .single();

  if (!site || site.user_id !== user.id) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  // Check plan limits
  const { data: profile } = await admin
    .from("profiles")
    .select("plan, plan_status, diagnoses_used_this_month")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const plan = (isAdmin(user.email) ? "agency" : profile.plan) as PlanName;
  const isFreePlan = plan === "free";
  // First-ever diagnosis on this site still flips has_free_diagnosis (the flag
  // the auto-diagnosis one-shot and the dashboard UI key off).
  const isFirstFreeDiagnosis = isFreePlan && !site.has_free_diagnosis;

  // Rate limit per plan
  const hourlyLimit = RATE_LIMITS_PER_HOUR[plan] ?? 3;
  if (!checkRateLimit(`diagnose:${user.id}`, hourlyLimit, 3_600_000)) {
    return NextResponse.json(
      { error: "You're analyzing too fast. Please wait a few minutes before running another diagnosis.", code: "slow_down" },
      { status: 429 },
    );
  }

  // Free plan: one shared lifetime pool, counted from table rows (counter
  // columns can drift; rows don't). Standalone URL analyses draw from the same
  // allowance — same pipeline, same cost. The welcome auto-diagnosis writes a
  // row like any other run, so it counts too. Each run costs real API money, so
  // the public version caps instead of gating behind upgrades — paid plans are
  // not enabled.
  if (plan === "free") {
    const lifetimeCount = await countFreeAnalysesUsed(admin, user.id);

    if (lifetimeCount >= FREE_LIFETIME_ANALYSES) {
      return NextResponse.json(
        { error: `This public version has a free usage cap (${FREE_LIFETIME_ANALYSES} AI analyses per account, shared between Search Console pages and standalone URLs). Paid plans are not enabled.`, code: "free_cap_reached" },
        { status: 403 },
      );
    }
  }

  // Block if subscription canceled (paid plans only — admin bypasses)
  if (plan !== "free" && profile.plan_status === "canceled" && !isAdmin(user.email)) {
    return NextResponse.json(
      { error: "Subscription canceled. Resubscribe to use AI diagnoses." },
      { status: 403 },
    );
  }

  // Check monthly limit (paid plans only — free uses the lifetime cap above)
  if (plan !== "free") {
    const limit = PLAN_LIMITS[plan]?.diagnoses_per_month ?? 0;
    if (profile.diagnoses_used_this_month >= limit) {
      return NextResponse.json(
        { error: `Monthly diagnosis limit reached (${limit}/${limit}).` },
        { status: 429 },
      );
    }
  }

  // Check for concurrent diagnosis — prevent user from running 2 at once
  const { data: recentDiag } = await admin
    .from("diagnoses")
    .select("id, created_at")
    .eq("user_id", user.id)
    .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentDiag) {
    const ageMs = Date.now() - new Date(recentDiag.created_at).getTime();
    // If a diagnosis finished in the last 30 seconds, it's probably still being written
    if (ageMs < 30_000) {
      return NextResponse.json(
        { error: "A diagnosis just completed. Please wait a moment before running another." },
        { status: 429 },
      );
    }
  }

  // Increment usage BEFORE running (prevents race condition) — the monthly
  // counter is a paid-plan concept; free uses the lifetime row count instead
  if (!isFreePlan) {
    await admin
      .from("profiles")
      .update({
        diagnoses_used_this_month: profile.diagnoses_used_this_month + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

  try {
    const result = await runDiagnosisPipeline(admin, pageId, user.id, "manual", parsed.data.keywordOverride);

    // Mark free diagnosis as used on success
    if (isFirstFreeDiagnosis) {
      await admin
        .from("sites")
        .update({ has_free_diagnosis: true })
        .eq("id", page.site_id);
    }

    // If auto-diagnosis had failed, transition to completed on manual success
    const { data: siteStatus } = await admin
      .from("sites")
      .select("auto_diagnosis_status")
      .eq("id", page.site_id)
      .single();

    if (siteStatus?.auto_diagnosis_status === "failed") {
      await admin
        .from("sites")
        .update({ auto_diagnosis_status: "completed" })
        .eq("id", page.site_id);
    }

    // Flush PostHog before serverless function exits
    await getPostHogServer().flush();

    return NextResponse.json({
      data: {
        diagnosisId: result.diagnosisId,
        diagnosis: result.diagnosis,
        brief: result.brief,
        costUsd: result.totalCostUsd,
        processingTimeMs: result.processingTimeMs,
      },
    });
  } catch (err) {
    // Rollback usage on failure — user shouldn't lose a diagnosis credit
    if (!isFreePlan) {
      await admin
        .from("profiles")
        .update({
          diagnoses_used_this_month: profile.diagnoses_used_this_month,
        })
        .eq("id", user.id);
    }

    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/diagnose] Pipeline error:", message);

    getPostHogServer().capture({
      distinctId: user.id,
      event: "diagnosis_failed",
      properties: { page_id: pageId, error: message },
    });
    await getPostHogServer().flush();

    // Map internal errors to user-friendly messages
    const userMessage = getUserFriendlyError(message);

    return NextResponse.json(
      { error: userMessage, code: "diagnosis_failed" },
      { status: 500 },
    );
  }
}

function getUserFriendlyError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("ai_disabled") || lower.includes("kill switch") || lower.includes("disabled via ai_disabled")) {
    return "AI analysis is temporarily disabled in this public version.";
  }
  if (lower.includes("spend cap")) {
    return "AI analysis is paused: this public version has a spending cap and it has been reached.";
  }
  if (lower.includes("page not found")) {
    return "This page could not be found. It may have been removed from your site.";
  }
  if (lower.includes("all ai providers failed")) {
    return "AI analysis is temporarily unavailable. Please try again in a few minutes.";
  }
  if (lower.includes("overloaded") || lower.includes("529") || lower.includes("capacity")) {
    return "Our AI service is temporarily overloaded. Please try again in a few minutes.";
  }
  if (lower.includes("rate") || lower.includes("429") || lower.includes("too many")) {
    return "Too many requests. Please wait a minute and try again.";
  }
  if (lower.includes("timeout") || lower.includes("timed out") || lower.includes("econnrefused")) {
    return "The analysis timed out. This can happen with very large pages. Please try again.";
  }
  if (lower.includes("invalid json") || lower.includes("json parse") || lower.includes("unexpected token")) {
    return "The AI returned an unexpected response. Please try again — this is usually a one-time issue.";
  }
  if (lower.includes("failed to save")) {
    return "The analysis completed but could not be saved. Please try again.";
  }
  if (lower.includes("fetch") || lower.includes("network") || lower.includes("enotfound")) {
    return "Could not reach your page or competitor pages. Check that the URL is accessible and try again.";
  }

  return "Something went wrong during the analysis. Your diagnosis credit was not consumed — please try again.";
}
