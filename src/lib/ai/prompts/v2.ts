/**
 * v2: Data-Driven — every claim backed by numbers, metrics tables, quantified gaps.
 */
import type { PromptData, PromptVersion } from "./types";
import type { DiagnosisResult } from "../diagnose";
import {
  SECURITY_BLOCK, DIAGNOSIS_SCHEMA_BLOCK, BRIEF_SCHEMA_BLOCK,
  JSON_RULES, DIAGNOSIS_OUTPUT_RULES, BRIEF_OUTPUT_RULES,
} from "./shared";

function buildDiagnosisPrompt(data: PromptData): string {
  const contextBlock = data.isNewPage
    ? `This is a NEW page with limited traffic history. Analyze content quality and competitive positioning.

PAGE: ${data.url}
CURRENT PERFORMANCE: ${data.clicks28d} clicks/28d, ${data.position ? `position #${data.position}` : "not yet ranking"}
PRIMARY KEYWORD: "${data.keyword}"`
    : `CONTEXT:
- Page: ${data.url}
- Primary keyword: ${data.keyword}
- Current performance: ${data.clicks28d} clicks, position #${data.position}, CTR ${data.ctr}%
- Peak performance: ${data.peakClicks} clicks in ${data.peakMonth}
- Decay: ${data.decayScore}% decline`;

  return `You are a data-driven SEO analyst. Every claim you make must be backed by specific numbers.

${SECURITY_BLOCK}

${contextBlock}

SERP ANALYSIS (top 10 results for "${data.keyword}"):
${data.serpResults}

COMPETITOR CONTENT (Top 3):
${data.competitors}

USER'S CONTENT:
${data.userContent}

GSC QUERY DATA:
${data.queryData}

DATA-DRIVEN ANALYSIS — every single claim needs a number:

MANDATORY METRICS for every diagnosis:
- Content length: exact word count for your page AND each competitor
  Format: 'Your page: 448 words | #1: 554 | #2: 516 | #3: 442'
- Heading count: 'Your page: 2 H2s, 1 H3 | #1: 5 H2s, 8 H3s | #2: 15 H2s'
- Topic coverage score: count topics covered vs total topics in the SERP
  Format: '4 of 11 key subtopics covered = 36% topic coverage'
- Image count: 'Your page: 3 images | #1: 8 images | #2: 12 images'
- Internal link count: 'Your page: 5 links | #1: 19 links | #2: 50 links'
- Estimated traffic impact per cause: use impressions × expected CTR
  'At position #8 you get ~3% CTR on 319 impressions = ~10 clicks/month.
  At position #3 you would get ~8% CTR = ~25 clicks/month. Gap: 15 clicks/month.'
- External link count and quality assessment

For each cause, provide a DATA TABLE in the evidence field:
  Metric | Your Page | Competitor #1 | Competitor #2 | Gap
  Words  | 448       | 554           | 516           | -68 to -106

Every cause MUST contain at least 3 specific numbers with sources.
The diagnosis should read like a data report, not an opinion piece.
No vague qualitative statements without supporting data.

RULES:
- Never say "content is outdated." Say exactly what is outdated and what the current data is.
- Maximum 5 causes, minimum 1.

${DIAGNOSIS_OUTPUT_RULES}

${DIAGNOSIS_SCHEMA_BLOCK}

${JSON_RULES}`;
}

function buildBriefPrompt(data: PromptData, diagnosis: DiagnosisResult): string {
  return `Based on the diagnosis below, generate a data-backed, actionable refresh brief with micro-drafts.

${SECURITY_BLOCK.replace("SERP, COMPETITOR, USER CONTENT, and QUERY DATA", "CONTENT and COMPETITOR")}

DIAGNOSIS:
${JSON.stringify(diagnosis, null, 2)}

PAGE URL: ${data.url}
CURRENT CONTENT SUMMARY: ${data.userContent}
COMPETITOR CONTENT (Top 3): ${data.competitors}

Create a prioritized list of specific actions to fix this page.
Each action MUST include a micro-draft to help the user execute immediately.

RULES:
- Each action must be SPECIFIC. Not "update content" but "Change title from 'X' to 'Y'"
- Include effort estimate in minutes for each action
- Prioritize: "urgent" (directly causing decay) / "important" (competitive gap) / "nice_to_have"
- You MUST return between 2 and 8 actions. Never fewer than 2.
- Include word count estimates for new sections
- Reference specific competitors when relevant

DATA-BACKED ACTIONS:
- Every action must include: estimated time, estimated word count to add, estimated traffic recovery
- Format: 'Add 300 words on light types → move from 448 to 748 words → closes 60% of word count gap with #1'
- Include total effort summary: 'All 6 actions = 4.5 hours total → estimated recovery: 150-300 clicks/month → ROI: ~$X in ad-equivalent value (assuming $0.50 CPC)'

MICRO-DRAFT RULES:
- For TITLE changes: provide 2-3 specific title suggestions ready to copy
- For NEW SECTIONS: list 3-5 specific topics/subtopics to cover with target word counts
- For OUTDATED FACTS: provide the correct/current data with source
- For FORMAT changes: suggest specific columns/rows with data
- For META/TECHNICAL: write the exact meta description or tag to use
- The user should be able to sit down and WRITE without researching anything else

${BRIEF_OUTPUT_RULES}

${BRIEF_SCHEMA_BLOCK}

${JSON_RULES}`;
}

export default { buildDiagnosisPrompt, buildBriefPrompt } satisfies PromptVersion;
