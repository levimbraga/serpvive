import type { SupabaseClient } from "@supabase/supabase-js";
import { searchGoogle } from "@/lib/serp/client";
import { fetchPage, fetchCompetitors, formatPageForPrompt, type FetchedPage } from "@/lib/firecrawl-fetcher";
import type { PageContent } from "@/lib/serp/fetcher";
import { validateContent } from "@/lib/url-validator";
import { runDiagnosis, type DiagnosisResult } from "./diagnose";
import { generateBrief, type RefreshBriefResult } from "./brief";
import { sanitizeForPrompt, sanitizeQuery } from "./sanitize";
import { getPostHogServer } from "@/lib/posthog/server";

// ── PostHog diagnosis tracking ──

function trackDiagnosis(params: {
  userId: string;
  url: string;
  keyword: string;
  isDemo: boolean;
  userPageMethod: string;
  competitorMethods: string[];
  diagnosisModel: string;
  briefModel: string;
  causesCount: number;
  topicCoveragePercent: number;
  fetchDurationMs: number;
  diagnosisDurationMs: number;
  briefDurationMs: number;
  totalDurationMs: number;
}) {
  try {
    const posthog = getPostHogServer();

    const allMethods = [params.userPageMethod, ...params.competitorMethods];
    const firecrawlCount = allMethods.filter((m) => m === "firecrawl").length;
    const cheerioCount = allMethods.filter((m) => m === "cheerio").length;
    const failedCount = allMethods.filter((m) => m === "failed").length;
    const total = firecrawlCount + cheerioCount + failedCount;

    posthog.capture({
      distinctId: params.userId,
      event: "diagnosis_completed",
      properties: {
        is_demo: params.isDemo,
        url: params.url,
        keyword: params.keyword,
        // Fetcher breakdown
        user_page_method: params.userPageMethod,
        competitor_1_method: params.competitorMethods[0] ?? "none",
        competitor_2_method: params.competitorMethods[1] ?? "none",
        competitor_3_method: params.competitorMethods[2] ?? "none",
        firecrawl_count: firecrawlCount,
        cheerio_count: cheerioCount,
        failed_count: failedCount,
        firecrawl_rate: total > 0 ? firecrawlCount / total : 0,
        // AI model breakdown
        diagnosis_model: params.diagnosisModel,
        brief_model: params.briefModel,
        used_primary_model: params.diagnosisModel.includes("opus"),
        // Quality
        causes_count: params.causesCount,
        topic_coverage_percent: params.topicCoveragePercent,
        // Performance
        fetch_duration_ms: params.fetchDurationMs,
        diagnosis_duration_ms: params.diagnosisDurationMs,
        brief_duration_ms: params.briefDurationMs,
        total_duration_ms: params.totalDurationMs,
      },
    });
  } catch (err) {
    console.error("[pipeline] PostHog tracking failed (non-blocking):", err);
  }
}

// ── Comparison table for AI prompt ──

function buildComparisonTable(
  userPage: PageContent | null,
  userUrl: string,
  competitors: (PageContent | null)[],
  competitorUrls: string[],
): string {
  const col = (page: PageContent | null, url: string) => {
    if (!page) return { wc: "N/A", hd: "N/A", il: "N/A", el: "N/A", pub: "N/A", mod: "N/A", domain: url };
    let domain: string;
    try { domain = new URL(url).hostname.replace("www.", ""); } catch { domain = url; }
    return {
      wc: String(page.wordCount),
      hd: String(page.headings.length),
      il: String(page.internalLinks.length),
      el: String(page.externalLinks.length),
      pub: page.publishedDate?.slice(0, 10) ?? "none",
      mod: page.lastModified?.slice(0, 10) ?? "none",
      domain,
    };
  };

  const u = col(userPage, userUrl);
  const cs = competitorUrls.map((url, i) => col(competitors[i] ?? null, url));

  const header = `| Metric | Your page | ${cs.map((c) => c.domain).join(" | ")} |`;
  const sep = `|--------|-----------|${cs.map(() => "---------").join("|")}|`;
  const rows = [
    `| Words | ${u.wc} | ${cs.map((c) => c.wc).join(" | ")} |`,
    `| Headings | ${u.hd} | ${cs.map((c) => c.hd).join(" | ")} |`,
    `| Int. links | ${u.il} | ${cs.map((c) => c.il).join(" | ")} |`,
    `| Ext. links | ${u.el} | ${cs.map((c) => c.el).join(" | ")} |`,
    `| Published | ${u.pub} | ${cs.map((c) => c.pub).join(" | ")} |`,
    `| Modified | ${u.mod} | ${cs.map((c) => c.mod).join(" | ")} |`,
  ];

  return [header, sep, ...rows].join("\n");
}

export type PipelineResult = {
  diagnosisId: string;
  diagnosis: DiagnosisResult;
  brief: RefreshBriefResult;
  totalCostUsd: number;
  processingTimeMs: number;
  modelUsed: string;
};

export type ExternalPipelineResult = {
  diagnosis: DiagnosisResult;
  brief: RefreshBriefResult;
  serpSnapshot: { keyword: string; results: unknown[]; fetched_at: string };
  tokensInput: number;
  tokensOutput: number;
  totalCostUsd: number;
  processingTimeMs: number;
  modelUsed: string;
};

/**
 * Full AI diagnosis pipeline:
 * 1. Get primary keyword from page data
 * 2. Search Google via Serper ($0.001)
 * 3. Fetch top 3 competitor content + user content (Firecrawl → Cheerio fallback)
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
  keywordOverride?: string,
): Promise<PipelineResult> {
  const startTime = Date.now();

  // Get page data
  const { data: page, error: pageErr } = await admin
    .from("pages")
    .select("url, path, status, primary_keyword, keyword_source, primary_position, current_clicks_28d, current_impressions_28d, current_ctr, current_avg_position, peak_clicks_monthly, peak_month, decay_score, site_id")
    .eq("id", pageId)
    .single();

  if (pageErr || !page) {
    throw new Error(`Page not found: ${pageErr?.message}`);
  }

  const isNewPage = page.status === "new" || page.status === "unknown";
  const keyword = keywordOverride ?? page.primary_keyword ?? page.path.split("/").pop()?.replace(/-/g, " ") ?? "unknown";
  const keywordSource = keywordOverride
    ? "override"
    : page.primary_keyword
      ? (page.keyword_source === "title" || page.keyword_source === "url" ? "estimated" : "gsc")
      : "estimated";

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

  // Step 2: Fetch content — user page FIRST (priority), then competitors in parallel
  const fetchStart = Date.now();
  console.log("[pipeline] Fetching user page...");
  const competitorUrls = serpResults
    .filter((r) => !r.url.includes(new URL(page.url).hostname))
    .slice(0, 3);

  // User page gets exclusive access to Firecrawl slots (30s timeout, fresh)
  const userContent = await fetchPage(page.url, { forceRefresh: true, timeout: 30000 });
  console.log(`[pipeline] User page: ${userContent?.wordCount ?? 0} words via ${userContent?.fetchMethod ?? "failed"}`);

  // Competitors in parallel (15s timeout, cached)
  console.log(`[pipeline] Fetching ${competitorUrls.length} competitors...`);
  const competitorContents = await fetchCompetitors(competitorUrls.map((r) => r.url));
  const fetchDurationMs = Date.now() - fetchStart;

  // Fetch summary for monitoring
  const methods = [userContent?.fetchMethod ?? "failed", ...competitorContents.map((c) => c?.fetchMethod ?? "failed")];
  const fcMethods = methods.filter((m) => m === "firecrawl").length;
  const chMethods = methods.filter((m) => m === "cheerio").length;
  const flMethods = methods.filter((m) => m === "failed").length;
  console.log(`[pipeline] Fetch summary: firecrawl=${fcMethods}, cheerio=${chMethods}, failed=${flMethods} (${fetchDurationMs}ms)`);

  // Build comparison table + format content for prompt
  const comparisonTable = buildComparisonTable(
    userContent, page.url,
    competitorContents, competitorUrls.map((r) => r.url),
  );

  const userContentStr = sanitizeForPrompt(formatPageForPrompt(userContent, page.url));
  const competitorsStr = sanitizeForPrompt(
    `═══ QUICK COMPARISON ═══\n${comparisonTable}\n\n` +
    competitorUrls
      .map((r, i) => formatPageForPrompt(competitorContents[i] ?? null, r.url))
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
  const diagStart = Date.now();
  console.log("[pipeline] Running AI diagnosis...");
  const diagResult = await runDiagnosis({
    isNewPage,
    url: page.url,
    keyword,
    clicks28d: page.current_clicks_28d,
    impressions28d: page.current_impressions_28d,
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
  const diagDurationMs = Date.now() - diagStart;

  // Step 5: Run AI brief
  const briefStart = Date.now();
  console.log("[pipeline] Generating refresh brief...");
  const briefResult = await generateBrief({
    url: page.url,
    diagnosisJson: JSON.stringify(diagResult.diagnosis, null, 2),
    userContent: userContentStr,
    competitors: competitorsStr,
  });
  const briefDurationMs = Date.now() - briefStart;

  const totalCostUsd = diagResult.costUsd + briefResult.costUsd;
  const processingTimeMs = Date.now() - startTime;

  // Track in PostHog
  trackDiagnosis({
    userId,
    url: page.url,
    keyword,
    isDemo: false,
    userPageMethod: userContent?.fetchMethod ?? "failed",
    competitorMethods: competitorContents.map((c) => c?.fetchMethod ?? "failed"),
    diagnosisModel: diagResult.modelUsed,
    briefModel: briefResult.modelUsed,
    causesCount: diagResult.diagnosis.causes.length,
    topicCoveragePercent: diagResult.diagnosis.topic_coverage.percentage,
    fetchDurationMs,
    diagnosisDurationMs: diagDurationMs,
    briefDurationMs,
    totalDurationMs: processingTimeMs,
  });

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
      model_used: diagResult.modelUsed,
      tokens_input: diagResult.tokensInput + briefResult.tokensInput,
      tokens_output: diagResult.tokensOutput + briefResult.tokensOutput,
      cost_usd: totalCostUsd,
      processing_time_ms: processingTimeMs,
      triggered_by: triggeredBy,
      keyword_used: keyword,
      keyword_source: keywordSource,
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

  console.log(`[pipeline] Done in ${(processingTimeMs / 1000).toFixed(1)}s, cost: $${totalCostUsd.toFixed(4)}, model: ${diagResult.modelUsed}`);

  return {
    diagnosisId: diagnosisRecord.id,
    diagnosis: diagResult.diagnosis,
    brief: briefResult.brief,
    totalCostUsd,
    processingTimeMs,
    modelUsed: diagResult.modelUsed,
  };
}

/**
 * External page analysis pipeline (no GSC data required):
 * 1. User provides URL + keyword
 * 2. Search Google via Serper
 * 3. Fetch competitors + user content (Firecrawl → Cheerio fallback)
 * 4. Run Claude Opus diagnosis (new page prompt, no GSC data)
 * 5. Run Claude Opus refresh brief
 * Returns result without saving — caller decides where to store.
 */
export async function runExternalPipeline(
  url: string,
  keyword: string,
): Promise<ExternalPipelineResult> {
  const startTime = Date.now();
  const elapsed = () => `${((Date.now() - startTime) / 1000).toFixed(1)}s`;

  // Step 1: Search Google
  console.log(`[DEMO ${elapsed()}] Starting SERP fetch for "${keyword}"`);
  let serpResults: Awaited<ReturnType<typeof searchGoogle>> = [];
  try {
    serpResults = await searchGoogle(keyword);
  } catch (err) {
    console.error(`[DEMO ${elapsed()}] Serper failed:`, err);
  }
  console.log(`[DEMO ${elapsed()}] SERP fetched, ${serpResults.length} results`);

  const serpResultsStr = serpResults.length > 0
    ? serpResults.map((r) => `#${r.position}: ${sanitizeForPrompt(r.title)}\n   ${r.url}\n   ${sanitizeForPrompt(r.snippet)}`).join("\n\n")
    : "No SERP data available";

  // Step 2: Fetch user content FIRST (priority, 30s timeout, fresh)
  const fetchStart = Date.now();
  console.log(`[DEMO ${elapsed()}] Fetching user page: ${url}`);
  const userContent = await fetchPage(url, { ssrfProtection: true, forceRefresh: true, timeout: 30000 });
  console.log(`[DEMO ${elapsed()}] User page: ${userContent?.wordCount ?? 0} words via ${userContent?.fetchMethod ?? "failed"}`);

  // Content quality check
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

  // Step 3: Fetch competitors in parallel (15s timeout, cached)
  console.log(`[DEMO ${elapsed()}] Fetching ${competitorUrls.length} competitors...`);
  const competitorContents = await fetchCompetitors(competitorUrls.map((r) => r.url));

  // Fetch summary for monitoring
  const methods = [userContent?.fetchMethod ?? "failed", ...competitorContents.map((c) => c?.fetchMethod ?? "failed")];
  const fcCount = methods.filter((m) => m === "firecrawl").length;
  const chCount = methods.filter((m) => m === "cheerio").length;
  const flCount = methods.filter((m) => m === "failed").length;
  const fetchDurationMs = Date.now() - fetchStart;
  console.log(`[DEMO ${elapsed()}] Fetch summary: firecrawl=${fcCount}, cheerio=${chCount}, failed=${flCount} (${fetchDurationMs}ms)`);

  // Build comparison table + format content for prompt
  const comparisonTable = buildComparisonTable(
    userContent, url,
    competitorContents, competitorUrls.map((r) => r.url),
  );

  const userContentStr = sanitizeForPrompt(formatPageForPrompt(userContent, url));
  const competitorsStr = sanitizeForPrompt(
    `═══ QUICK COMPARISON ═══\n${comparisonTable}\n\n` +
    competitorUrls
      .map((r, i) => formatPageForPrompt(competitorContents[i] ?? null, r.url))
      .join("\n\n---\n\n")
  );

  const queryDataStr = `GSC data is not available for this analysis. The user provided the target keyword manually: '${sanitizeForPrompt(keyword)}'.

Focus your analysis on SERP competition, content comparison, and on-page factors. You cannot reference impression counts, CTR from GSC, or actual click data.

When possible, estimate traffic impact per cause in clicks/month based on typical search volume for this keyword/niche. Be transparent that these are estimates.

If the content was truncated during fetch, note it: 'Content may have been truncated during analysis.'`;

  // Step 4: AI diagnosis
  const diagStart = Date.now();
  console.log(`[DEMO ${elapsed()}] Starting AI diagnosis`);
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
  const diagDurationMs = Date.now() - diagStart;
  console.log(`[DEMO ${elapsed()}] Diagnosis complete (model: ${diagResult.modelUsed}, ${diagDurationMs}ms)`);

  // Step 5: AI brief — truncate content since diagnosis already analyzed it
  const briefStart = Date.now();
  console.log(`[DEMO ${elapsed()}] Starting AI brief (userContent: ${userContentStr.length} chars → 5000, competitors: ${competitorsStr.length} chars → 3000)`);
  const briefResult = await generateBrief({
    url,
    diagnosisJson: JSON.stringify(diagResult.diagnosis, null, 2),
    userContent: userContentStr.slice(0, 12000),
    competitors: competitorsStr.slice(0, 8000),
    noGscData: true,
  });
  const briefDurationMs = Date.now() - briefStart;
  console.log(`[DEMO ${elapsed()}] Brief complete (${briefDurationMs}ms)`);

  const totalCostUsd = diagResult.costUsd + briefResult.costUsd;
  const processingTimeMs = Date.now() - startTime;
  const tokensInput = diagResult.tokensInput + briefResult.tokensInput;
  const tokensOutput = diagResult.tokensOutput + briefResult.tokensOutput;

  // Track in PostHog
  trackDiagnosis({
    userId: "demo",
    url,
    keyword,
    isDemo: true,
    userPageMethod: userContent?.fetchMethod ?? "failed",
    competitorMethods: competitorContents.map((c) => c?.fetchMethod ?? "failed"),
    diagnosisModel: diagResult.modelUsed,
    briefModel: briefResult.modelUsed,
    causesCount: diagResult.diagnosis.causes.length,
    topicCoveragePercent: diagResult.diagnosis.topic_coverage.percentage,
    fetchDurationMs,
    diagnosisDurationMs: diagDurationMs,
    briefDurationMs,
    totalDurationMs: processingTimeMs,
  });

  console.log(`[DEMO ${elapsed()}] Pipeline done. Cost: $${totalCostUsd.toFixed(4)}, model: ${diagResult.modelUsed}, tokens: ${tokensInput}in/${tokensOutput}out`);

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
    modelUsed: diagResult.modelUsed,
  };
}
