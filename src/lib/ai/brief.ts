import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { extractJson } from "./json-extract";

const anthropic = new Anthropic();

// ── Zod Schema ──

export const RefreshBriefSchema = z.object({
  total_effort_hours: z.number(),
  actions: z.array(z.object({
    priority: z.enum(["urgent", "important", "nice_to_have"]),
    title: z.string(),
    description: z.string(),
    effort_minutes: z.number(),
    category: z.enum(["title", "content", "structure", "technical", "meta"]),
    micro_draft: z.object({
      type: z.enum([
        "title_suggestions", "topics_to_cover", "corrected_data",
        "format_suggestion", "meta_text", "general_guidance",
      ]),
      suggestions: z.array(z.string()).default([]),
      competitor_references: z.array(z.string()).optional(),
    }),
  })).min(1).max(15),
});

export type RefreshBriefResult = z.infer<typeof RefreshBriefSchema>;

// ── Brief Generation ──

export type BriefParams = {
  url: string;
  diagnosisJson: string;
  userContent: string;
  competitors: string;
};

export type BriefOutput = {
  brief: RefreshBriefResult;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
};

/**
 * Generates a Refresh Brief with micro-drafts via Claude Opus 4.6.
 * Second AI call in the pipeline (after diagnosis).
 */
export async function generateBrief(params: BriefParams): Promise<BriefOutput> {
  const prompt = `Based on the diagnosis below, generate a specific, actionable refresh brief
with micro-drafts that help the user write without additional research.

DIAGNOSIS:
${params.diagnosisJson}

PAGE URL: ${params.url}
CURRENT CONTENT SUMMARY: ${params.userContent}
COMPETITOR CONTENT (Top 3): ${params.competitors}

INSTRUCTIONS:
Create a prioritized list of specific actions to fix this page.
Each action MUST include a micro-draft to help the user execute immediately.

RULES:
- Each action must be SPECIFIC. Not "update content" but "Change title from 'X' to 'Y'"
- Include effort estimate in minutes for each action
- Prioritize: "urgent" (directly causing decay) / "important" (competitive gap) / "nice_to_have"
- You MUST return between 2 and 8 actions. Never fewer than 2. If the page has only one issue, add a secondary improvement action.
- Include word count estimates for new sections
- Reference specific competitors when relevant

MICRO-DRAFT RULES (the key differentiator):
- For TITLE changes: provide 2-3 specific title suggestions ready to copy
- For NEW SECTIONS: list 3-5 specific topics/subtopics to cover, referencing what competitors include
- For OUTDATED FACTS: provide the correct/current data
- For FORMAT changes (tables, lists): suggest specific columns/rows
- For META/TECHNICAL: write the exact meta description or tag to use
- The user should be able to sit down and WRITE without researching anything else

CRITICAL RULES FOR OUTPUT:
- Every action MUST have: priority, title, description, effort_minutes, category, and micro_draft.
- Every micro_draft MUST have: type and suggestions (array with at least 1 item).
- competitor_references in micro_draft is OPTIONAL — include only when relevant.
- Return the COMPLETE JSON in a single response. Do not stop mid-response.

Return ONLY valid JSON matching this schema:
{
  "total_effort_hours": number,
  "actions": [{
    "priority": "urgent|important|nice_to_have",
    "title": "string",
    "description": "string",
    "effort_minutes": number,
    "category": "title|content|structure|technical|meta",
    "micro_draft": {
      "type": "title_suggestions|topics_to_cover|corrected_data|format_suggestion|meta_text|general_guidance",
      "suggestions": ["string"],
      "competitor_references": ["string"] (optional)
    }
  }]
}

CRITICAL: Return ONLY valid JSON. No markdown, no code fences, no explanatory text before or after the JSON. Start with { and end with }. Ensure all strings are properly escaped — no unescaped quotes, newlines, or special characters inside string values.`;

  let response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  let text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  console.log("[brief] Response:", {
    tokens_output: response.usage?.output_tokens,
    stop_reason: response.stop_reason,
  });

  let json = extractJson(text);

  // Truncate actions if Opus returned more than 8 (avoids unnecessary retry)
  if (json?.actions && Array.isArray(json.actions) && json.actions.length > 8) {
    console.warn("[brief] Opus returned", json.actions.length, "actions, truncating to 8");
    json.actions = json.actions.slice(0, 8);
  }

  let parsed = RefreshBriefSchema.safeParse(json);

  // Retry 1x with lightweight prompt if invalid
  if (!parsed.success) {
    console.error("[brief] Zod validation FAILED — details:", {
      tokens_used: response.usage?.output_tokens,
      stop_reason: response.stop_reason,
      raw_json_keys: json ? Object.keys(json) : "NULL_JSON",
      raw_json_preview: JSON.stringify(json).slice(0, 500),
      zod_issues: JSON.stringify(parsed.error.issues, null, 2),
    });

    response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 8192,
      messages: [
        { role: "user", content: "Return valid JSON for an SEO refresh brief." },
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

    console.log("[brief] Retry response:", {
      tokens_output: response.usage?.output_tokens,
      stop_reason: response.stop_reason,
    });

    json = extractJson(text);
    parsed = RefreshBriefSchema.safeParse(json);

    if (!parsed.success) {
      console.error("[brief] Retry also FAILED — details:", {
        raw_json_keys: json ? Object.keys(json) : "NULL_JSON",
        raw_json_preview: JSON.stringify(json).slice(0, 500),
        zod_issues: JSON.stringify(parsed.error.issues, null, 2),
      });
      throw new Error(`Brief JSON invalid after retry: ${parsed.error.message}`);
    }
  }

  const tokensInput = response.usage.input_tokens;
  const tokensOutput = response.usage.output_tokens;
  const costUsd = (tokensInput * 15 + tokensOutput * 75) / 1_000_000;

  return {
    brief: parsed.data,
    tokensInput,
    tokensOutput,
    costUsd: Math.round(costUsd * 10000) / 10000,
  };
}
