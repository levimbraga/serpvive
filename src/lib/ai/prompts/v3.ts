/**
 * v3: Ultra Specific — forces extreme specificity with evidence.
 */
import type { PromptData, PromptVersion } from "./types";
import type { DiagnosisResult } from "../diagnose";
import v1 from "./v1";

const SPECIFICITY_ADDON = `
SPECIFICITY IS EVERYTHING — non-negotiable rules:
- NEVER say 'update your content' → say WHAT to update WITH WHAT
- NEVER say 'add more detail' → say WHICH detail, cite exact source
- NEVER say 'improve readability' → say WHICH section, HOW exactly
- NEVER say 'content is thin' without: current word count, competitor word counts, target word count, and WHICH specific topics to add
- Every cause MUST include a direct quote from a competitor as evidence
- Every cause MUST include at least one specific number
- If you cannot be extremely specific, DO NOT include that cause
- 3 ultra-specific causes beat 5 vague ones every time
- Name specific competitor URLs, not just 'competitors'
- Reference specific SERP positions: 'SERP #3 (mountaincrest.com)'`;

const BRIEF_ADDON = `
Every micro-draft must be copy-pasteable. Zero additional research needed.`;

function buildDiagnosisPrompt(data: PromptData): string {
  const base = v1.buildDiagnosisPrompt(data);
  return base.replace(
    "CRITICAL RULES FOR OUTPUT:",
    `${SPECIFICITY_ADDON}\n\nCRITICAL RULES FOR OUTPUT:`,
  );
}

function buildBriefPrompt(data: PromptData, diagnosis: DiagnosisResult): string {
  const base = v1.buildBriefPrompt(data, diagnosis);
  return base.replace(
    "MICRO-DRAFT RULES (the key differentiator):",
    `${BRIEF_ADDON}\n\nMICRO-DRAFT RULES (the key differentiator):`,
  );
}

export default { buildDiagnosisPrompt, buildBriefPrompt } satisfies PromptVersion;
