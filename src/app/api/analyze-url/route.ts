import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/constants";
import { checkUsage } from "@/lib/limits";
import type { PlanName } from "@/lib/constants";
import { runExternalPipeline } from "@/lib/ai/pipeline";
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

  // Rate limit, free lifetime pool, canceled subscription and monthly quota, in
  // that order — see checkUsage. Everything here runs before a cent is spent.
  const refusal = await checkUsage(admin, {
    userId: user.id,
    email: user.email,
    plan,
    planStatus: profile.plan_status,
    monthlyUsed: profile.diagnoses_used_this_month,
    action: "analyze-url",
  });

  if (refusal) {
    const { status, ...body } = refusal;
    return NextResponse.json(body, { status });
  }

  // Increment usage BEFORE running (prevents race condition) — paid plans only;
  // free is capped by the shared row count above
  if (plan !== "free") {
    await admin
      .from("profiles")
      .update({
        diagnoses_used_this_month: profile.diagnoses_used_this_month + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

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
        // Set only when a `diagnoses` row was written for this same run, so the
        // shared free count can skip this row and charge exactly one credit.
        page_id: savedToPage ? pageId : null,
        keyword,
        diagnosis: result.diagnosis,
        refresh_brief: result.brief,
        serp_snapshot: result.serpSnapshot,
        // Record the model that actually served the request — a hardcoded ID
        // here silently mislabels every run that used the fallback chain.
        model_used: result.modelUsed,
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
    await getPostHogServer().flush();

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
    // Rollback usage on failure (paid-plan counter only; free never incremented)
    if (plan !== "free") {
      await admin
        .from("profiles")
        .update({ diagnoses_used_this_month: profile.diagnoses_used_this_month })
        .eq("id", user.id);
    }

    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/analyze-url] Pipeline error:", message);

    getPostHogServer().capture({
      distinctId: user.id,
      event: "external_analysis_failed",
      properties: { url, keyword, error: message },
    });
    await getPostHogServer().flush();

    if (err instanceof Error && err.name === "AiDisabledError") {
      return NextResponse.json(
        { error: "AI analysis is temporarily disabled in this public version." },
        { status: 503 },
      );
    }

    if (err instanceof Error && err.name === "AiSpendCapExceededError") {
      return NextResponse.json(
        { error: "AI analysis is paused: this public version has a spending cap and it has been reached." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Something went wrong during the analysis. Your diagnosis credit was not consumed — please try again." },
      { status: 500 },
    );
  }
}
