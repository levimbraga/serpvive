import type { SupabaseClient } from "@supabase/supabase-js";
import { searchGoogle } from "@/lib/serp/client";
import { fetchPageContent, formatContentForPrompt } from "@/lib/serp/fetcher";
import { runDiagnosis, type DiagnosisResult } from "./diagnose";
import { generateBrief, type RefreshBriefResult } from "./brief";

export type PipelineResult = {
  diagnosisId: string;
  diagnosis: DiagnosisResult;
  brief: RefreshBriefResult;
  totalCostUsd: number;
  processingTimeMs: number;
};

/**
 * Full AI diagnosis pipeline:
 * 1. Get primary keyword from page data
 * 2. Search Google via Serper ($0.001)
 * 3. Fetch top 3 competitor content + user content (Cheerio)
 * 4. Run Claude Opus diagnosis (~$0.07)
 * 5. Run Claude Opus refresh brief (~$0.05)
 * 6. Save everything to DB
 * Total: ~$0.12 per diagnosis, ~2 minutes
 */
export async function runDiagnosisPipeline(
  admin: SupabaseClient,
  pageId: string,
  userId: string,
  triggeredBy: "manual" | "auto" | "cron" = "manual",
): Promise<PipelineResult> {
  const startTime = Date.now();

  // Get page data
  const { data: page, error: pageErr } = await admin
    .from("pages")
    .select("url, path, status, primary_keyword, primary_position, current_clicks_28d, current_impressions_28d, current_ctr, current_avg_position, peak_clicks_monthly, peak_month, decay_score, site_id")
    .eq("id", pageId)
    .single();

  if (pageErr || !page) {
    throw new Error(`Page not found: ${pageErr?.message}`);
  }

  const isNewPage = page.status === "new" || page.status === "unknown";
  const keyword = page.primary_keyword ?? page.path.split("/").pop()?.replace(/-/g, " ") ?? "unknown";

  // Step 1: Search Google
  console.log(`[pipeline] Searching Google for "${keyword}"...`);
  let serpResults: Awaited<ReturnType<typeof searchGoogle>> = [];
  try {
    serpResults = await searchGoogle(keyword);
  } catch (err) {
    console.error("[pipeline] Serper failed:", err);
  }

  const serpResultsStr = serpResults.length > 0
    ? serpResults.map((r) => `#${r.position}: ${r.title}\n   ${r.url}\n   ${r.snippet}`).join("\n\n")
    : "No SERP data available";

  // Step 2: Fetch content (user + top 3 competitors)
  console.log("[pipeline] Fetching content...");
  const competitorUrls = serpResults
    .filter((r) => !r.url.includes(new URL(page.url).hostname))
    .slice(0, 3);

  const [userContent, ...competitorContents] = await Promise.all([
    fetchPageContent(page.url),
    ...competitorUrls.map((r) => fetchPageContent(r.url)),
  ]);

  const userContentStr = formatContentForPrompt(userContent, page.url);
  const competitorsStr = competitorUrls
    .map((r, i) => formatContentForPrompt(competitorContents[i] ?? null, r.url))
    .join("\n\n---\n\n");

  // Step 3: Get query data
  let queryDataStr = "No query data available";
  const { data: queries } = await admin
    .from("page_queries")
    .select("query, clicks, impressions, position")
    .eq("page_id", pageId)
    .order("clicks", { ascending: false })
    .limit(20);

  if (queries && queries.length > 0) {
    queryDataStr = queries
      .map((q) => `"${q.query}" — ${q.clicks} clicks, ${q.impressions} impr, pos #${q.position.toFixed(1)}`)
      .join("\n");
  }

  // Step 4: Run AI diagnosis
  console.log("[pipeline] Running AI diagnosis...");
  const diagResult = await runDiagnosis({
    isNewPage,
    url: page.url,
    keyword,
    clicks28d: page.current_clicks_28d,
    position: page.primary_position,
    ctr: page.current_ctr,
    peakClicks: page.peak_clicks_monthly,
    peakMonth: page.peak_month ?? "unknown",
    decayScore: page.decay_score,
    serpResults: serpResultsStr,
    competitors: competitorsStr,
    userContent: userContentStr,
    queryData: queryDataStr,
  });

  // Step 5: Run AI brief
  console.log("[pipeline] Generating refresh brief...");
  const briefResult = await generateBrief({
    url: page.url,
    diagnosisJson: JSON.stringify(diagResult.diagnosis, null, 2),
    userContent: userContentStr,
    competitors: competitorsStr,
  });

  const totalCostUsd = diagResult.costUsd + briefResult.costUsd;
  const processingTimeMs = Date.now() - startTime;

  // Step 6: Save to DB
  console.log("[pipeline] Saving to database...");
  const { data: diagnosisRecord, error: insertErr } = await admin
    .from("diagnoses")
    .insert({
      page_id: pageId,
      user_id: userId,
      diagnosis: diagResult.diagnosis,
      refresh_brief: briefResult.brief,
      serp_snapshot: {
        keyword,
        results: serpResults,
        fetched_at: new Date().toISOString(),
      },
      model_used: "claude-opus-4-6",
      tokens_input: diagResult.tokensInput + briefResult.tokensInput,
      tokens_output: diagResult.tokensOutput + briefResult.tokensOutput,
      cost_usd: totalCostUsd,
      processing_time_ms: processingTimeMs,
      triggered_by: triggeredBy,
    })
    .select("id")
    .single();

  if (insertErr) {
    throw new Error(`Failed to save diagnosis: ${insertErr.message}`);
  }

  // Update page last_diagnosis_at
  await admin
    .from("pages")
    .update({
      last_diagnosis_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId);

  console.log(`[pipeline] Done in ${(processingTimeMs / 1000).toFixed(1)}s, cost: $${totalCostUsd.toFixed(4)}`);

  return {
    diagnosisId: diagnosisRecord.id,
    diagnosis: diagResult.diagnosis,
    brief: briefResult.brief,
    totalCostUsd,
    processingTimeMs,
  };
}
