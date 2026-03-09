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
      suggestions: z.array(z.string()).min(1).max(5),
      competitor_references: z.array(z.string()).optional(),
    }),
  })).min(2).max(8),
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
- Maximum 8 actions, minimum 2
- Include word count estimates for new sections
- Reference specific competitors when relevant

MICRO-DRAFT RULES (the key differentiator):
- For TITLE changes: provide 2-3 specific title suggestions ready to copy
- For NEW SECTIONS: list 3-5 specific topics/subtopics to cover, referencing what competitors include
- For OUTDATED FACTS: provide the correct/current data
- For FORMAT changes (tables, lists): suggest specific columns/rows
- For META/TECHNICAL: write the exact meta description or tag to use
- The user should be able to sit down and WRITE without researching anything else

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

  let json = extractJson(text);
  let parsed = RefreshBriefSchema.safeParse(json);

  // Retry 1x if invalid
  if (!parsed.success) {
    console.warn("[brief] JSON parse failed, retrying...", {
      tokens_used: response.usage?.output_tokens,
      stop_reason: response.stop_reason,
      error: parsed.error.message,
    });

    response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 8192,
      messages: [
        { role: "user", content: prompt },
        { role: "assistant", content: text },
        { role: "user", content: `The JSON was invalid. Error: ${parsed.error.message}\n\nReturn ONLY valid JSON.` },
      ],
    });

    text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    json = extractJson(text);
    parsed = RefreshBriefSchema.safeParse(json);

    if (!parsed.success) {
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

