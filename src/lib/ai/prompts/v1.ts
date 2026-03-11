/**
 * v1: Baseline — exact copy of current production prompts.
 */
import type { PromptData, PromptVersion } from "./types";
import type { DiagnosisResult } from "../diagnose";
import {
  SECURITY_BLOCK, DIAGNOSIS_SCHEMA_BLOCK, BRIEF_SCHEMA_BLOCK,
  JSON_RULES, DIAGNOSIS_OUTPUT_RULES, BRIEF_OUTPUT_RULES,
} from "./shared";

function buildDiagnosisPrompt(data: PromptData): string {
  if (data.isNewPage) {
    const positionStr = data.position ? `position #${data.position}` : "not yet ranking";
    return `You are a world-class SEO analyst. This is a NEW page with limited traffic history.
Instead of diagnosing decay, analyze the content quality and competitive positioning.

${SECURITY_BLOCK}

PAGE: ${data.url}
CURRENT PERFORMANCE: ${data.clicks28d} clicks/28d, ${positionStr}
PRIMARY KEYWORD: "${data.keyword}"

SERP ANALYSIS (top 10 results for "${data.keyword}"):
${data.serpResults}

COMPETITOR CONTENT (Top 3):
${data.competitors}

USER'S CONTENT:
${data.userContent}

ANALYZE:
1. How does this content compare to the top 3 competitors?
2. What topics/sections are competitors covering that this page misses?
3. Is the title and meta description competitive?
4. What format gaps exist (tables, lists, images, video)?
5. What specific improvements would help this page rank higher?

${DIAGNOSIS_OUTPUT_RULES}

${DIAGNOSIS_SCHEMA_BLOCK}

${JSON_RULES}`;
  }

  return `You are a world-class SEO analyst specializing in content decay diagnosis.

${SECURITY_BLOCK}

CONTEXT:
- Page: ${data.url}
- Primary keyword: ${data.keyword}
- Current performance: ${data.clicks28d} clicks, position #${data.position}, CTR ${data.ctr}%
- Peak performance: ${data.peakClicks} clicks in ${data.peakMonth}
- Decay: ${data.decayScore}% decline

SERP ANALYSIS:
${data.serpResults}

COMPETITOR CONTENT (Top 3):
${data.competitors}

USER'S CONTENT:
${data.userContent}

GSC QUERY DATA:
${data.queryData}

INSTRUCTIONS:
Analyze WHY this page is losing traffic. Be EXTREMELY SPECIFIC.

RULES:
- Never say "content is outdated." Say exactly what is outdated and what the current data is.
- Every cause MUST have concrete evidence from the SERP or competitor analysis.
- Compare headings, topics, dates, facts between user and competitors.
- Identify: new competitors, outdated info, intent shifts, missing topics, format gaps, technical issues.
- Maximum 5 causes, minimum 1.

${DIAGNOSIS_OUTPUT_RULES}

${DIAGNOSIS_SCHEMA_BLOCK}

${JSON_RULES}`;
}

function buildBriefPrompt(data: PromptData, diagnosis: DiagnosisResult): string {
  return `Based on the diagnosis below, generate a specific, actionable refresh brief
with micro-drafts that help the user write without additional research.

${SECURITY_BLOCK.replace("SERP, COMPETITOR, USER CONTENT, and QUERY DATA", "CONTENT and COMPETITOR")}

DIAGNOSIS:
${JSON.stringify(diagnosis, null, 2)}

PAGE URL: ${data.url}
CURRENT CONTENT SUMMARY: ${data.userContent}
COMPETITOR CONTENT (Top 3): ${data.competitors}

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

${BRIEF_OUTPUT_RULES}

${BRIEF_SCHEMA_BLOCK}

${JSON_RULES}`;
}

export default { buildDiagnosisPrompt, buildBriefPrompt } satisfies PromptVersion;
