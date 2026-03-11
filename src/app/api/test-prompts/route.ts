import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { searchGoogle } from "@/lib/serp/client";
import { fetchPageContent, formatContentForPrompt } from "@/lib/serp/fetcher";
import { sanitizeForPrompt, sanitizeQuery } from "@/lib/ai/sanitize";
import { runWithPrompt, type TestResultOrError } from "@/lib/ai/test-runner";
import type { PromptData } from "@/lib/ai/prompts/types";

export const maxDuration = 600;

const ADMIN_EMAIL = "levimaiabraga@gmail.com";

const InputSchema = z.object({
  page_id: z.string().uuid(),
  versions: z.array(z.string().regex(/^v\d+$/)).min(1).max(10),
});

export async function POST(request: Request) {
  // Auth check
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  const { page_id, versions } = parsed.data;

  const admin = getSupabaseAdmin();

  // Fetch page data
  const { data: page, error: pageErr } = await admin
    .from("pages")
    .select("url, path, status, primary_keyword, primary_position, current_clicks_28d, current_impressions_28d, current_ctr, current_avg_position, peak_clicks_monthly, peak_month, decay_score, site_id")
    .eq("id", page_id)
    .single();

  if (pageErr || !page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const isNewPage = page.status === "new" || page.status === "unknown";
  const keyword = page.primary_keyword ?? page.path.split("/").pop()?.replace(/-/g, " ") ?? "unknown";

  // Step 1: Search Google (1 time only)
  console.log(`[test-prompts] Searching Google for "${keyword}"...`);
  let serpResults: Awaited<ReturnType<typeof searchGoogle>> = [];
  try {
    serpResults = await searchGoogle(keyword);
  } catch (err) {
    console.error("[test-prompts] Serper failed:", err);
  }

  const serpResultsStr = serpResults.length > 0
    ? serpResults.map((r) => `#${r.position}: ${sanitizeForPrompt(r.title)}\n   ${r.url}\n   ${sanitizeForPrompt(r.snippet)}`).join("\n\n")
    : "No SERP data available";

  // Step 2: Fetch content (1 time only)
  console.log("[test-prompts] Fetching content...");
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
      .join("\n\n---\n\n"),
  );

  // Step 3: Get query data
  let queryDataStr = "No query data available";
  const { data: queries } = await admin
    .from("page_queries")
    .select("query, clicks, impressions, position")
    .eq("page_id", page_id)
    .order("clicks", { ascending: false })
    .limit(20);

  if (queries && queries.length > 0) {
    queryDataStr = queries
      .map((q) => `"${sanitizeQuery(q.query)}" — ${q.clicks} clicks, ${q.impressions} impr, pos #${q.position.toFixed(1)}`)
      .join("\n");
  }

  // Build shared data object
  const promptData: PromptData = {
    isNewPage,
    url: page.url,
    keyword,
    clicks28d: page.current_clicks_28d,
    position: page.primary_position ?? 0,
    ctr: page.current_ctr ?? 0,
    peakClicks: page.peak_clicks_monthly ?? 0,
    peakMonth: page.peak_month ?? "unknown",
    decayScore: page.decay_score ?? 0,
    serpResults: serpResultsStr,
    competitors: competitorsStr,
    userContent: userContentStr,
    queryData: queryDataStr,
  };

  // Step 4: Run all versions in parallel
  console.log(`[test-prompts] Running ${versions.length} prompt versions in parallel...`);
  const settled = await Promise.allSettled(
    versions.map((v) => runWithPrompt(promptData, v)),
  );

  const results: TestResultOrError[] = settled.map((s, i) => {
    if (s.status === "fulfilled") return s.value;
    return {
      version: versions[i]!,
      name: versions[i]!,
      error: s.reason instanceof Error ? s.reason.message : "Unknown error",
      duration_ms: 0,
      tokens: { input: 0, output: 0 },
      cost_usd: 0,
    };
  });

  const totalCost = results.reduce((acc, r) => acc + r.cost_usd, 0);
  const totalDuration = Math.max(...results.map((r) => r.duration_ms));

  console.log(`[test-prompts] Done. Total cost: $${totalCost.toFixed(4)}, max duration: ${(totalDuration / 1000).toFixed(1)}s`);

  return NextResponse.json({
    data: {
      results,
      summary: {
        total_cost_usd: Math.round(totalCost * 10000) / 10000,
        total_duration_ms: totalDuration,
        versions_run: versions.length,
        versions_succeeded: results.filter((r) => !r.error).length,
        versions_failed: results.filter((r) => r.error).length,
      },
    },
  });
}
