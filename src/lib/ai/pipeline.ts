import type { SupabaseClient } from "@supabase/supabase-js";
import { searchGoogle } from "@/lib/serp/client";
import { fetchPageContent, formatContentForPrompt } from "@/lib/serp/fetcher";
import { validateContent } from "@/lib/url-validator";
import { runDiagnosis, type DiagnosisResult } from "./diagnose";
import { generateBrief, type RefreshBriefResult } from "./brief";
import { sanitizeForPrompt, sanitizeQuery } from "./sanitize";

export type PipelineResult = {
  diagnosisId: string;
  diagnosis: DiagnosisResult;
  brief: RefreshBriefResult;
  totalCostUsd: number;
  processingTimeMs: number;
};

export type ExternalPipelineResult = {
  diagnosis: DiagnosisResult;
  brief: RefreshBriefResult;
  serpSnapshot: { keyword: string; results: unknown[]; fetched_at: string };
  tokensInput: number;
  tokensOutput: number;
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
 * Total: ~$0.12 per diagnosis, ~2-3 minutes
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
    ? serpResults.map((r) => `#${r.position}: ${sanitizeForPrompt(r.title)}\n   ${r.url}\n   ${sanitizeForPrompt(r.snippet)}`).join("\n\n")
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

  const userContentStr = sanitizeForPrompt(formatContentForPrompt(userContent, page.url));
  const competitorsStr = sanitizeForPrompt(
    competitorUrls
      .map((r, i) => formatContentForPrompt(competitorContents[i] ?? null, r.url))
      .join("\n\n---\n\n")
  );

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
      .map((q) => `"${sanitizeQuery(q.query)}" — ${q.clicks} clicks, ${q.impressions} impr, pos #${q.position.toFixed(1)}`)
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

/**
 * External page analysis pipeline (no GSC data required):
 * 1. User provides URL + keyword
 * 2. Search Google via Serper
 * 3. Fetch competitors + user content (Cheerio)
 * 4. Run Claude Opus diagnosis (new page prompt, no GSC data)
 * 5. Run Claude Opus refresh brief
 * Returns result without saving — caller decides where to store.
 */
export async function runExternalPipeline(
  url: string,
  keyword: string,
): Promise<ExternalPipelineResult> {
  const startTime = Date.now();

  // Step 1: Search Google
  console.log(`[external-pipeline] Searching Google for "${keyword}"...`);
  let serpResults: Awaited<ReturnType<typeof searchGoogle>> = [];
  try {
    serpResults = await searchGoogle(keyword);
  } catch (err) {
    console.error("[external-pipeline] Serper failed:", err);
  }

  const serpResultsStr = serpResults.length > 0
    ? serpResults.map((r) => `#${r.position}: ${sanitizeForPrompt(r.title)}\n   ${r.url}\n   ${sanitizeForPrompt(r.snippet)}`).join("\n\n")
    : "No SERP data available";

  // Step 2: Fetch user content (SSRF-protected) + competitor content
  console.log("[external-pipeline] Fetching user content...");
  const userContent = await fetchPageContent(url, { ssrfProtection: true });

  // Content quality check — reject pages with too little text
  const contentError = validateContent(userContent?.wordCount ?? 0);
  if (contentError) {
    throw new Error(contentError);
  }

  let userHostname: string;
  try {
    userHostname = new URL(url).hostname;
  } catch {
    userHostname = "";
  }

  const competitorUrls = serpResults
    .filter((r) => !r.url.includes(userHostname))
    .slice(0, 3);

  console.log("[external-pipeline] Fetching competitor content...");
  const competitorContents = await Promise.all(
    competitorUrls.map((r) => fetchPageContent(r.url)),
  );

  const userContentStr = sanitizeForPrompt(formatContentForPrompt(userContent, url));
  const competitorsStr = sanitizeForPrompt(
    competitorUrls
      .map((r, i) => formatContentForPrompt(competitorContents[i] ?? null, r.url))
      .join("\n\n---\n\n")
  );

  // Step 3: Build GSC-less query data note
  const queryDataStr = `GSC data is not available for this analysis. The user provided the target keyword manually: '${sanitizeForPrompt(keyword)}'.

Focus your analysis on SERP competition, content comparison, and on-page factors. You cannot reference impression counts, CTR from GSC, or actual click data.

When possible, estimate traffic impact per cause in clicks/month based on typical search volume for this keyword/niche. Be transparent that these are estimates.

If the content was truncated during fetch, note it: 'Content may have been truncated during analysis.'`;

  // Step 4: Run AI diagnosis (always uses "new page" style since no decay data)
  console.log("[external-pipeline] Running AI diagnosis...");
  const diagResult = await runDiagnosis({
    isNewPage: true,
    url,
    keyword,
    clicks28d: 0,
    position: null,
    serpResults: serpResultsStr,
    competitors: competitorsStr,
    userContent: userContentStr,
    queryData: queryDataStr,
  });

  // Step 5: Run AI brief
  console.log("[external-pipeline] Generating refresh brief...");
  const briefResult = await generateBrief({
    url,
    diagnosisJson: JSON.stringify(diagResult.diagnosis, null, 2),
    userContent: userContentStr,
    competitors: competitorsStr,
    noGscData: true,
  });

  const totalCostUsd = diagResult.costUsd + briefResult.costUsd;
  const processingTimeMs = Date.now() - startTime;
  const tokensInput = diagResult.tokensInput + briefResult.tokensInput;
  const tokensOutput = diagResult.tokensOutput + briefResult.tokensOutput;

  console.log(`[external-pipeline] Done in ${(processingTimeMs / 1000).toFixed(1)}s, cost: $${totalCostUsd.toFixed(4)}`);

  return {
    diagnosis: diagResult.diagnosis,
    brief: briefResult.brief,
    serpSnapshot: {
      keyword,
      results: serpResults,
      fetched_at: new Date().toISOString(),
    },
    tokensInput,
    tokensOutput,
    totalCostUsd,
    processingTimeMs,
  };
}
