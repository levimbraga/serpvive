import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const RefreshInputSchema = z.object({
  pageId: z.string().uuid(),
  diagnosisId: z.string().uuid(),
  actionsCompleted: z.array(z.string()).default([]),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = RefreshInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { pageId, diagnosisId, actionsCompleted } = parsed.data;
  const admin = getSupabaseAdmin();

  // Verify page belongs to user
  const { data: page } = await admin
    .from("pages")
    .select("id, site_id, current_clicks_28d, current_impressions_28d, current_ctr, current_avg_position")
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

  // Verify diagnosis exists and belongs to this page
  const { data: diagnosis } = await admin
    .from("diagnoses")
    .select("id")
    .eq("id", diagnosisId)
    .eq("page_id", pageId)
    .single();

  if (!diagnosis) {
    return NextResponse.json({ error: "Diagnosis not found" }, { status: 404 });
  }

  // Check if there's already a pending refresh for this page
  const { data: existingRefresh } = await admin
    .from("refreshes")
    .select("id")
    .eq("page_id", pageId)
    .eq("result_status", "pending")
    .maybeSingle();

  if (existingRefresh) {
    return NextResponse.json({ error: "A refresh is already being tracked for this page" }, { status: 409 });
  }

  // Create refresh with before-snapshot of current metrics
  const { data: refresh, error } = await admin
    .from("refreshes")
    .insert({
      page_id: pageId,
      diagnosis_id: diagnosisId,
      user_id: user.id,
      actions_completed: actionsCompleted,
      before_clicks_28d: page.current_clicks_28d,
      before_impressions_28d: page.current_impressions_28d,
      before_ctr: page.current_ctr,
      before_avg_position: page.current_avg_position,
      result_status: "pending",
    })
    .select("id, refreshed_at")
    .single();

  if (error) {
    console.error("[api/refresh] Insert error:", error);
    return NextResponse.json({ error: "Failed to create refresh" }, { status: 500 });
  }

  // Update page last_refresh_at
  await admin
    .from("pages")
    .update({ last_refresh_at: new Date().toISOString() })
    .eq("id", pageId);

  return NextResponse.json({
    data: {
      refreshId: refresh.id,
      refreshedAt: refresh.refreshed_at,
    },
  });
}
