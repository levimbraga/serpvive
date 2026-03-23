import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PLAN_LIMITS, RATE_LIMITS_PER_HOUR, isAdmin } from "@/lib/constants";
import type { PlanName } from "@/lib/constants";
import { runExternalPipeline } from "@/lib/ai/pipeline";
import { checkRateLimit } from "@/lib/rate-limit";
import { getPostHogServer } from "@/lib/posthog/server";
import { validateUrl } from "@/lib/url-validator";

export const maxDuration = 300; // 5 minutes

const AnalyzeUrlSchema = z.object({
  url: z.string().url().startsWith("https://"),
  keyword: z.string().min(2).max(200),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = AnalyzeUrlSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid HTTPS URL and a keyword (2+ chars)." },
      { status: 400 },
    );
  }

  // SSRF / URL validation
  const urlCheck = await validateUrl(parsed.data.url);
  if (!urlCheck.ok) {
    return NextResponse.json({ error: urlCheck.error }, { status: 400 });
  }

  const { keyword } = parsed.data;
  const url = urlCheck.url;
  const admin = getSupabaseAdmin();

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

  // Rate limit per plan
  const hourlyLimit = RATE_LIMITS_PER_HOUR[plan] ?? 3;
  if (!checkRateLimit(`analyze-url:${user.id}`, hourlyLimit, 3_600_000)) {
    return NextResponse.json(
      { error: "You're analyzing too fast. Please wait a few minutes before running another diagnosis.", code: "slow_down" },
      { status: 429 },
    );
  }

  if (plan === "free") {
    return NextResponse.json(
      { error: "Upgrade to a paid plan to run AI analyses." },
      { status: 403 },
    );
  }

  if (profile.plan_status === "canceled" && !isAdmin(user.email)) {
    return NextResponse.json(
      { error: "Subscription canceled. Resubscribe to use AI analyses." },
      { status: 403 },
    );
  }

  const limit = PLAN_LIMITS[plan]?.diagnoses_per_month ?? 0;
  if (profile.diagnoses_used_this_month >= limit) {
    return NextResponse.json(
      { error: `Monthly analysis limit reached (${limit}/${limit}). Upgrade for more.`, code: "limit_reached" },
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
    // Check if the URL belongs to a connected GSC site
    const { data: matchingSite } = await admin
      .from("sites")
      .select("id")
      .eq("user_id", user.id)
      .filter("domain", "ilike", `%${new URL(url).hostname}%`)
      .limit(1)
      .maybeSingle();

    let savedToPage = false;
    let pageId: string | null = null;

    const result = await runExternalPipeline(url, keyword);

    if (matchingSite) {
      // URL belongs to a connected site — save as a page + diagnosis
      const { data: existingPage } = await admin
        .from("pages")
        .select("id")
        .eq("site_id", matchingSite.id)
        .eq("url", url)
        .maybeSingle();

      if (existingPage) {
        pageId = existingPage.id;
      } else {
        // Create the page
        const urlObj = new URL(url);
        const { data: newPage } = await admin
          .from("pages")
          .insert({
            site_id: matchingSite.id,
            url,
            path: urlObj.pathname,
            title: null,
            primary_keyword: keyword,
            keyword_source: "title",
            status: "unknown",
          })
          .select("id")
          .single();

        pageId = newPage?.id ?? null;
      }

      if (pageId) {
        await admin.from("diagnoses").insert({
          page_id: pageId,
          user_id: user.id,
          diagnosis: result.diagnosis,
          refresh_brief: result.brief,
          serp_snapshot: result.serpSnapshot,
          model_used: result.modelUsed,
          tokens_input: result.tokensInput,
          tokens_output: result.tokensOutput,
          cost_usd: result.totalCostUsd,
          processing_time_ms: result.processingTimeMs,
          triggered_by: "manual",
        });

        await admin.from("pages").update({
          last_diagnosis_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", pageId);

        savedToPage = true;
      }
    }

    // Also save as external analysis (always, for the /pages/analyze view)
    const { data: externalRecord } = await admin
      .from("external_analyses")
      .insert({
        user_id: user.id,
        url,
        keyword,
        diagnosis: result.diagnosis,
        refresh_brief: result.brief,
        serp_snapshot: result.serpSnapshot,
        model_used: "claude-opus-4-6",
        tokens_input: result.tokensInput,
        tokens_output: result.tokensOutput,
        cost_usd: result.totalCostUsd,
      })
      .select("id")
      .single();

    getPostHogServer().capture({
      distinctId: user.id,
      event: "external_analysis_completed",
      properties: { url, keyword, cost_usd: result.totalCostUsd, saved_to_page: savedToPage },
    });

    return NextResponse.json({
      data: {
        analysisId: externalRecord?.id,
        pageId: savedToPage ? pageId : null,
        diagnosis: result.diagnosis,
        brief: result.brief,
        processingTimeMs: result.processingTimeMs,
      },
    });
  } catch (err) {
    // Rollback usage on failure
    await admin
      .from("profiles")
      .update({ diagnoses_used_this_month: profile.diagnoses_used_this_month })
      .eq("id", user.id);

    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/analyze-url] Pipeline error:", message);

    getPostHogServer().capture({
      distinctId: user.id,
      event: "external_analysis_failed",
      properties: { url, keyword, error: message },
    });

    return NextResponse.json(
      { error: "Something went wrong during the analysis. Your diagnosis credit was not consumed — please try again." },
      { status: 500 },
    );
  }
}
