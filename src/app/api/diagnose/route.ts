import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";

export const maxDuration = 300; // 5 minutes
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PLAN_LIMITS } from "@/lib/constants";
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

  // Rate limit: max 3 diagnoses per minute per user
  if (!checkRateLimit(`diagnose:${user.id}`, 3, 60_000)) {
    return NextResponse.json(
      {
        error: "Please wait a moment before running another analysis. Each diagnosis takes significant processing power.",
        code: "slow_down",
        retry_after: 60,
      },
      { status: 429 },
    );
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
    .select("user_id")
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

  const plan = profile.plan as PlanName;

  // Block free plan users — they get 1 auto-diagnosis only
  if (plan === "free") {
    return NextResponse.json(
      { error: "Upgrade to a paid plan to run AI diagnoses." },
      { status: 403 },
    );
  }

  // Block if subscription canceled
  if (profile.plan_status === "canceled") {
    return NextResponse.json(
      { error: "Subscription canceled. Resubscribe to use AI diagnoses." },
      { status: 403 },
    );
  }

  const limit = PLAN_LIMITS[plan]?.diagnoses_per_month ?? 0;

  if (profile.diagnoses_used_this_month >= limit) {
    return NextResponse.json(
      { error: `Diagnosis limit reached (${limit}/${limit}). Upgrade your plan for more.` },
      { status: 429 },
    );
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

  // Increment usage BEFORE running (prevents race condition)
  await admin
    .from("profiles")
    .update({
      diagnoses_used_this_month: profile.diagnoses_used_this_month + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  try {
    const result = await runDiagnosisPipeline(admin, pageId, user.id, "manual", parsed.data.keywordOverride);

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
    await admin
      .from("profiles")
      .update({
        diagnoses_used_this_month: profile.diagnoses_used_this_month,
      })
      .eq("id", user.id);

    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/diagnose] Pipeline error:", message);

    getPostHogServer().capture({
      distinctId: user.id,
      event: "diagnosis_failed",
      properties: { page_id: pageId, error: message },
    });

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

  if (lower.includes("page not found")) {
    return "This page could not be found. It may have been removed from your site.";
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
