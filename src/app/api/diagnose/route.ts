import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PLAN_LIMITS } from "@/lib/constants";
import type { PlanName } from "@/lib/constants";
import { runDiagnosisPipeline } from "@/lib/ai/pipeline";

const DiagnoseInputSchema = z.object({
  pageId: z.string().uuid(),
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

  // Increment usage BEFORE running (prevents race condition)
  await admin
    .from("profiles")
    .update({
      diagnoses_used_this_month: profile.diagnoses_used_this_month + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  try {
    const result = await runDiagnosisPipeline(admin, pageId, user.id);

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
    // Rollback usage on failure
    await admin
      .from("profiles")
      .update({
        diagnoses_used_this_month: profile.diagnoses_used_this_month,
      })
      .eq("id", user.id);

    console.error("[api/diagnose] Pipeline error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Diagnosis failed" },
      { status: 500 },
    );
  }
}
