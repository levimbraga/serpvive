import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { extractJson } from "./json-extract";

const anthropic = new Anthropic();

// ── Zod Schemas ──

export const DiagnosisSchema = z.object({
  summary: z.string().max(500),
  causes: z.array(z.object({
    title: z.string(),
    description: z.string(),
    severity: z.enum(["high", "medium", "low"]),
    evidence: z.string(),
    category: z.enum([
      "outdated_content", "new_competitors", "intent_shift",
      "missing_topic", "format_gap", "technical_issue",
      "cannibalization", "thin_content",
      // Additional categories for new page analysis
      "content_gap", "title_meta", "internal_linking", "content_structure",
    ]),
  })).min(1).max(10),
  serp_analysis: z.object({
    top_competitors: z.array(z.object({
      url: z.string(),
      title: z.string(),
      strengths: z.array(z.string()).default([]),
    })).default([]),
    intent_type: z.enum(["informational", "commercial", "transactional", "navigational"]),
    content_format_trend: z.string(),
  }),
});

export type DiagnosisResult = z.infer<typeof DiagnosisSchema>;

// ── Prompt Builders ──

function buildDecayPrompt(params: {
  url: string;
  keyword: string;
  clicks28d: number;
  position: number;
  ctr: number;
  peakClicks: number;
  peakMonth: string;
  decayScore: number;
  serpResults: string;
  competitors: string;
  userContent: string;
  queryData: string;
}): string {
  return `You are a world-class SEO analyst specializing in content decay diagnosis.

CONTEXT:
- Page: ${params.url}
- Primary keyword: ${params.keyword}
- Current performance: ${params.clicks28d} clicks, position #${params.position}, CTR ${params.ctr}%
- Peak performance: ${params.peakClicks} clicks in ${params.peakMonth}
- Decay: ${params.decayScore}% decline

SERP ANALYSIS:
${params.serpResults}

COMPETITOR CONTENT (Top 3):
${params.competitors}

USER'S CONTENT:
${params.userContent}

GSC QUERY DATA:
${params.queryData}

INSTRUCTIONS:
Analyze WHY this page is losing traffic. Be EXTREMELY SPECIFIC.

RULES:
- Never say "content is outdated." Say exactly what is outdated and what the current data is.
- Every cause MUST have concrete evidence from the SERP or competitor analysis.
- Compare headings, topics, dates, facts between user and competitors.
- Identify: new competitors, outdated info, intent shifts, missing topics, format gaps, technical issues.
- Maximum 5 causes, minimum 1.

CRITICAL RULES FOR OUTPUT:
- Every cause MUST have: title, description, severity, evidence, and category.
- serp_analysis MUST have: intent_type and content_format_trend.
- top_competitors is an array of objects with url, title, and strengths (array of strings).
- Return the COMPLETE JSON in a single response. Do not stop mid-response.

Return ONLY valid JSON matching this schema:
{
  "summary": "string (max 300 chars)",
  "causes": [{ "title": "string", "description": "string", "severity": "high|medium|low", "evidence": "string", "category": "outdated_content|new_competitors|intent_shift|missing_topic|format_gap|technical_issue|cannibalization|thin_content" }],
  "serp_analysis": { "top_competitors": [{ "url": "string", "title": "string", "strengths": ["string"] }], "intent_type": "informational|commercial|transactional|navigational", "content_format_trend": "string" }
}

CRITICAL: Return ONLY valid JSON. No markdown, no code fences, no explanatory text before or after the JSON. Start with { and end with }. Ensure all strings are properly escaped — no unescaped quotes, newlines, or special characters inside string values.`;
}

function buildNewPagePrompt(params: {
  url: string;
  keyword: string | null;
  clicks28d: number;
  position: number | null;
  serpResults: string;
  competitors: string;
  userContent: string;
}): string {
  const positionStr = params.position ? `position #${params.position}` : "not yet ranking";
  const keywordStr = params.keyword ?? "unknown";

  return `You are a world-class SEO analyst. This is a NEW page with limited traffic history.
Instead of diagnosing decay, analyze the content quality and competitive positioning.

PAGE: ${params.url}
CURRENT PERFORMANCE: ${params.clicks28d} clicks/28d, ${positionStr}
PRIMARY KEYWORD: "${keywordStr}"

SERP ANALYSIS (top 10 results for "${keywordStr}"):
${params.serpResults}

COMPETITOR CONTENT (Top 3):
${params.competitors}

USER'S CONTENT:
${params.userContent}

ANALYZE:
1. How does this content compare to the top 3 competitors?
2. What topics/sections are competitors covering that this page misses?
3. Is the title and meta description competitive?
4. What format gaps exist (tables, lists, images, video)?
5. What specific improvements would help this page rank higher?

CRITICAL RULES FOR OUTPUT:
- Every cause MUST have: title, description, severity, evidence, and category.
- serp_analysis MUST have: intent_type and content_format_trend.
- top_competitors is an array of objects with url, title, and strengths (array of strings).
- Return the COMPLETE JSON in a single response. Do not stop mid-response.

Return ONLY valid JSON matching this schema:
{
  "summary": "string (max 300 chars)",
  "causes": [{ "title": "string", "description": "string", "severity": "high|medium|low", "evidence": "string", "category": "content_gap|format_gap|thin_content|title_meta|internal_linking|content_structure" }],
  "serp_analysis": { "top_competitors": [{ "url": "string", "title": "string", "strengths": ["string"] }], "intent_type": "informational|commercial|transactional|navigational", "content_format_trend": "string" }
}

CRITICAL: Return ONLY valid JSON. No markdown, no code fences, no explanatory text before or after the JSON. Start with { and end with }. Ensure all strings are properly escaped — no unescaped quotes, newlines, or special characters inside string values.`;
}

// ── Main Diagnosis Function ──

export type DiagnoseParams = {
  isNewPage: boolean;
  url: string;
  keyword: string | null;
  clicks28d: number;
  position: number | null;
  ctr?: number;
  peakClicks?: number;
  peakMonth?: string;
  decayScore?: number;
  serpResults: string;
  competitors: string;
  userContent: string;
  queryData?: string;
};

export type DiagnoseResult = {
  diagnosis: DiagnosisResult;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
};

/**
 * Runs AI diagnosis via Claude Opus 4.6.
 * Uses decay prompt for established pages, content analysis prompt for new pages.
 * Retries 1x with lightweight prompt if JSON is invalid.
 */
export async function runDiagnosis(params: DiagnoseParams): Promise<DiagnoseResult> {
  const prompt = params.isNewPage
    ? buildNewPagePrompt({
        url: params.url,
        keyword: params.keyword,
        clicks28d: params.clicks28d,
        position: params.position,
        serpResults: params.serpResults,
        competitors: params.competitors,
        userContent: params.userContent,
      })
    : buildDecayPrompt({
        url: params.url,
        keyword: params.keyword ?? "unknown",
        clicks28d: params.clicks28d,
        position: params.position ?? 0,
        ctr: params.ctr ?? 0,
        peakClicks: params.peakClicks ?? 0,
        peakMonth: params.peakMonth ?? "unknown",
        decayScore: params.decayScore ?? 0,
        serpResults: params.serpResults,
        competitors: params.competitors,
        userContent: params.userContent,
        queryData: params.queryData ?? "No query data available",
      });

  // First attempt
  let response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  let text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  console.log("[diagnose] Response:", {
    tokens_output: response.usage?.output_tokens,
    stop_reason: response.stop_reason,
    page_url: params.url,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json = extractJson(text) as any;

  // Truncate causes if Opus returned more than 5 (avoids unnecessary retry)
  if (json?.causes && Array.isArray(json.causes) && json.causes.length > 5) {
    console.warn("[diagnose] Opus returned", json.causes.length, "causes, truncating to 5");
    json.causes = json.causes.slice(0, 5);
  }

  let parsed = DiagnosisSchema.safeParse(json);

  // Retry 1x with lightweight prompt if invalid
  if (!parsed.success) {
    console.error("[diagnose] Zod validation FAILED — details:", {
      tokens_used: response.usage?.output_tokens,
      stop_reason: response.stop_reason,
      page_url: params.url,
      raw_json_keys: json ? Object.keys(json) : "NULL_JSON",
      raw_json_preview: JSON.stringify(json).slice(0, 500),
      zod_issues: JSON.stringify(parsed.error.issues, null, 2),
    });

    response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 8192,
      messages: [
        { role: "user", content: "Return valid JSON for an SEO diagnosis." },
        { role: "assistant", content: text },
        {
          role: "user",
          content: `Your previous JSON had validation errors:\n${JSON.stringify(parsed.error.issues, null, 2)}\n\nFix these issues and return the COMPLETE valid JSON. Start with { and end with }.`,
        },
      ],
    });

    text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    console.log("[diagnose] Retry response:", {
      tokens_output: response.usage?.output_tokens,
      stop_reason: response.stop_reason,
    });

    json = extractJson(text);
    parsed = DiagnosisSchema.safeParse(json);

    if (!parsed.success) {
      console.error("[diagnose] Retry also FAILED — details:", {
        raw_json_keys: json ? Object.keys(json) : "NULL_JSON",
        raw_json_preview: JSON.stringify(json).slice(0, 500),
        zod_issues: JSON.stringify(parsed.error.issues, null, 2),
      });
      throw new Error(`Diagnosis JSON invalid after retry: ${parsed.error.message}`);
    }
  }

  const tokensInput = response.usage.input_tokens;
  const tokensOutput = response.usage.output_tokens;
  // Opus 4.6 pricing: $15/M input, $75/M output
  const costUsd = (tokensInput * 15 + tokensOutput * 75) / 1_000_000;

  return {
    diagnosis: parsed.data,
    tokensInput,
    tokensOutput,
    costUsd: Math.round(costUsd * 10000) / 10000,
  };
}
