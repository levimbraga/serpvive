/**
 * v2: Balanced Google + User — considers both SEO and reader satisfaction.
 */
import type { PromptData, PromptVersion } from "./types";
import type { DiagnosisResult } from "../diagnose";
import {
  SECURITY_BLOCK, DIAGNOSIS_SCHEMA_BLOCK, BRIEF_SCHEMA_BLOCK,
  JSON_RULES, DIAGNOSIS_OUTPUT_RULES, BRIEF_OUTPUT_RULES,
} from "./shared";
import v1 from "./v1";

const BALANCE_ADDON = `
ANALYSIS BALANCE: Every finding must consider BOTH dimensions:

A) SEARCH ENGINE (Google ranking factors):
- Keyword relevance in title, H1, headings, body text
- Content depth vs top-ranking competitors
- Heading hierarchy and structure
- E-E-A-T signals (experience, expertise, authority, trust)
- Content freshness and last update date
- Internal/external linking quality

B) USER EXPERIENCE (reader satisfaction):
- Readability: scannable? clear headings? short paragraphs?
- Engagement: would a real person find this useful?
- Visual aids: images, tables, diagrams where needed?
- Actionability: can the reader DO something after reading?
- Trust: authentic voice? personal experience? real data?
- Mobile readability: works on phone screens?

For each cause, indicate dimension: 'google', 'user', or 'both'.
The best fixes improve BOTH. Prioritize 'both' over single-dimension.`;

const BRIEF_ADDON = `
For each action, include reader impact: what changes for the person READING the blog post after this fix. Not just SEO — human impact.`;

function buildDiagnosisPrompt(data: PromptData): string {
  const base = v1.buildDiagnosisPrompt(data);
  // Insert the balance addon before the schema block
  return base.replace(
    "CRITICAL RULES FOR OUTPUT:",
    `${BALANCE_ADDON}\n\nCRITICAL RULES FOR OUTPUT:`,
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
