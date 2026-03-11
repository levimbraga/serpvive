import Anthropic from "@anthropic-ai/sdk";
import { DiagnosisSchema, type DiagnosisResult } from "./diagnose";
import { RefreshBriefSchema, type RefreshBriefResult } from "./brief";
import { extractJson } from "./json-extract";
import { sanitizeAiOutput } from "./sanitize";
import type { PromptData, PromptVersion } from "./prompts/types";

const anthropic = new Anthropic();

export const PROMPT_NAMES: Record<string, string> = {
  v1: "Baseline (current)",
  v2: "Balanced Google + User",
  v3: "Ultra Specific",
  v4: "Impact x Effort Framework",
  v5: "Conversational & Empathetic",
  v6: "Data-Driven",
  v7: "Competitor Deep-Dive",
  v8: "Intent-First",
  v9: "Quick Wins Only",
  v10: "Editorial Complete",
};

export type TestResult = {
  version: string;
  name: string;
  diagnosis: DiagnosisResult;
  brief: RefreshBriefResult;
  duration_ms: number;
  tokens: { input: number; output: number };
  cost_usd: number;
  error?: undefined;
};

export type TestError = {
  version: string;
  name: string;
  error: string;
  diagnosis?: undefined;
  brief?: undefined;
  duration_ms: number;
  tokens: { input: number; output: number };
  cost_usd: number;
};

export type TestResultOrError = TestResult | TestError;

// Dynamically import prompt version
async function loadPromptVersion(version: string): Promise<PromptVersion> {
  switch (version) {
    case "v1": return (await import("./prompts/v1")).default;
    case "v2": return (await import("./prompts/v2")).default;
    case "v3": return (await import("./prompts/v3")).default;
    case "v4": return (await import("./prompts/v4")).default;
    case "v5": return (await import("./prompts/v5")).default;
    default: throw new Error(`Unknown prompt version: ${version}`);
  }
}

async function callOpus(prompt: string, maxTokens: number) {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  return { text, usage: response.usage };
}

function parseAndValidateDiagnosis(text: string): DiagnosisResult {
  let json = extractJson(text);

  // Truncate causes to 5 if needed
  if (json && typeof json === "object" && "causes" in json && Array.isArray((json as Record<string, unknown>).causes)) {
    const causes = (json as Record<string, unknown>).causes as unknown[];
    if (causes.length > 5) {
      (json as Record<string, unknown>).causes = causes.slice(0, 5);
    }
  }

  const parsed = DiagnosisSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Diagnosis validation failed: ${parsed.error.issues.map(i => i.message).join(", ")}`);
  }
  return parsed.data;
}

function parseAndValidateBrief(text: string): RefreshBriefResult {
  let json = extractJson(text);

  // Truncate actions to 8 if needed
  if (json && typeof json === "object" && "actions" in json && Array.isArray((json as Record<string, unknown>).actions)) {
    const actions = (json as Record<string, unknown>).actions as unknown[];
    if (actions.length > 8) {
      (json as Record<string, unknown>).actions = actions.slice(0, 8);
    }
  }

  const parsed = RefreshBriefSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Brief validation failed: ${parsed.error.issues.map(i => i.message).join(", ")}`);
  }
  return parsed.data;
}

export async function runWithPrompt(
  data: PromptData,
  version: string,
): Promise<TestResultOrError> {
  const startTime = Date.now();
  let totalInput = 0;
  let totalOutput = 0;
  const name = PROMPT_NAMES[version] ?? version;

  try {
    const promptVersion = await loadPromptVersion(version);

    // Run diagnosis
    const diagPrompt = promptVersion.buildDiagnosisPrompt(data);
    const diagResponse = await callOpus(diagPrompt, 8192);
    const diagnosis = parseAndValidateDiagnosis(diagResponse.text);
    totalInput += diagResponse.usage.input_tokens;
    totalOutput += diagResponse.usage.output_tokens;

    // Run brief
    const briefPrompt = promptVersion.buildBriefPrompt(data, diagnosis);
    const briefResponse = await callOpus(briefPrompt, 8192);
    const brief = parseAndValidateBrief(briefResponse.text);
    totalInput += briefResponse.usage.input_tokens;
    totalOutput += briefResponse.usage.output_tokens;

    const cost = (totalInput * 5 + totalOutput * 25) / 1_000_000;

    return {
      version,
      name,
      diagnosis: sanitizeAiOutput(diagnosis) as DiagnosisResult,
      brief: sanitizeAiOutput(brief) as RefreshBriefResult,
      duration_ms: Date.now() - startTime,
      tokens: { input: totalInput, output: totalOutput },
      cost_usd: Math.round(cost * 10000) / 10000,
    };
  } catch (err) {
    const cost = (totalInput * 5 + totalOutput * 25) / 1_000_000;
    return {
      version,
      name,
      error: err instanceof Error ? err.message : "Unknown error",
      duration_ms: Date.now() - startTime,
      tokens: { input: totalInput, output: totalOutput },
      cost_usd: Math.round(cost * 10000) / 10000,
    };
  }
}
