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
import { getUserFriendlyError } from "@/lib/ai/user-errors";

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
        const { data: newPage, error: pageErr } = await admin
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

        if (pageErr) {
          console.error("[api/analyze-url] Could not create page row:", pageErr.message);
        }
        pageId = newPage?.id ?? null;
      }

      if (pageId) {
        const { error: diagErr } = await admin.from("diagnoses").insert({
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

        if (diagErr) {
          // Not fatal — the standalone record below is what this endpoint
          // returns. But it must not pass silently: an unwritten `diagnoses`
          // row means the run is invisible to the page history and to the
          // shared free count.
          console.error("[api/analyze-url] Could not save diagnosis row:", diagErr.message);
        }

        await admin.from("pages").update({
          last_diagnosis_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", pageId);

        savedToPage = !diagErr;
      }
    }

    // Also save as external analysis (always, for the /pages/analyze view)
    const { data: externalRecord, error: externalErr } = await admin
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

    if (externalErr) {
      // The analysis itself succeeded and has already been paid for, so this
      // still returns the result — but a failed insert means no permalink and
      // no credit counted, and it used to vanish into an ignored destructure.
      // The most likely cause is a schema drift on `page_id`: see
      // supabase/migrations/20260820_link_external_analyses_to_pages.sql.
      console.error("[api/analyze-url] Could not save external analysis:", externalErr.message);
    }

    // Analytics must never sink a completed analysis — the pipeline already
    // treats its own tracking as non-blocking, and this call sits after the
    // expensive work with nothing left to roll back.
    try {
      getPostHogServer().capture({
        distinctId: user.id,
        event: "external_analysis_completed",
        properties: { url, keyword, cost_usd: result.totalCostUsd, saved_to_page: savedToPage },
      });
      await getPostHogServer().flush();
    } catch (trackErr) {
      console.error("[api/analyze-url] PostHog tracking failed (non-blocking):", trackErr);
    }

    return NextResponse.json({
      data: {
        analysisId: externalRecord?.id ?? null,
        pageId: savedToPage ? pageId : null,
        diagnosis: result.diagnosis,
        brief: result.brief,
        processingTimeMs: result.processingTimeMs,
        // Present only when the result could not be persisted, so the user
        // knows to copy what's on screen instead of expecting it in history.
        ...(externalErr
          ? { warning: "This analysis could not be saved to your history — it won't be here after you leave the page." }
          : {}),
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

    try {
      getPostHogServer().capture({
        distinctId: user.id,
        event: "external_analysis_failed",
        properties: { url, keyword, error: message },
      });
      await getPostHogServer().flush();
    } catch (trackErr) {
      console.error("[api/analyze-url] PostHog tracking failed (non-blocking):", trackErr);
    }

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

    // Say what actually broke. This route reported every failure with the same
    // generic sentence, so a page too short to analyze, an AI outage and a
    // malformed model response were indistinguishable to the user.
    return NextResponse.json(
      { error: getUserFriendlyError(message), code: "analysis_failed" },
      { status: 500 },
    );
  }
}
