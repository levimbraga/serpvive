/**
 * v4: Intent-First — search intent as primary lens for all analysis.
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

  return `You are an SEO analyst who views everything through the lens of search intent satisfaction.

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

SEARCH INTENT AS PRIMARY LENS:

Before analyzing anything else, deeply analyze the search intent:

1. INTENT DECOMPOSITION: What is the searcher REALLY trying to accomplish?
   Go beyond informational/commercial/transactional labels.
   Example: 'succulent grow lights' → person has succulents dying indoors, tried a windowsill, it's not working. They need to know: Do I even need a light? Which type? How much to spend? How to set it up? Will it actually save my plants?

2. INTENT EVIDENCE FROM SERP: Do the actual results confirm or contradict your intent hypothesis? What mix of content types rank? (guides vs products vs forums vs videos) What does People Also Ask reveal about sub-intents?

3. INTENT SATISFACTION SCORE: Rate 1-10 how well the user's page satisfies the search intent vs each competitor.
   Format: 'Intent satisfaction: Your page 4/10 | #1: 7/10 | #2: 9/10 | #3: 6/10'

4. INTENT GAPS as causes: Frame every cause as an intent gap.
   NOT: 'missing comparison table'
   BUT: 'Searcher wants to quickly compare options but your page forces them to read paragraphs — competitors offer a comparison table that satisfies this intent in 10 seconds. This is why they click back to Google.'

5. INTENT PRIORITIZATION: Fix the biggest intent gaps first.
   The core question for every recommendation:
   'Does this make the searcher's job easier and faster?'

RULES:
- Never say "content is outdated." Say exactly what is outdated and what the current data is.
- Every cause MUST have concrete evidence from the SERP or competitor analysis.
- Maximum 5 causes, minimum 1.

${DIAGNOSIS_OUTPUT_RULES}

${DIAGNOSIS_SCHEMA_BLOCK}

${JSON_RULES}`;
}

function buildBriefPrompt(data: PromptData, diagnosis: DiagnosisResult): string {
  return `Based on the diagnosis below, generate an intent-driven, actionable refresh brief with micro-drafts.

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

INTENT-DRIVEN ACTIONS:
- Every action must start with the USER NEED it addresses:
  'Searchers need to quickly compare products → Add comparison table'
  NOT: 'Add comparison table for better SERP signals'
- Group actions by user journey stage:
  Stage 1: 'Do I need this?' (educational)
  Stage 2: 'What are my options?' (comparison)
  Stage 3: 'Which one should I buy?' (decision)
  Stage 4: 'How do I set it up?' (implementation)
- For each action, explain: 'Without this, the searcher will bounce to [competitor] to find this answer instead.'

MICRO-DRAFT RULES:
- For TITLE changes: provide 2-3 specific title suggestions that promise intent satisfaction
- For NEW SECTIONS: list 3-5 topics that address specific user questions
- For OUTDATED FACTS: provide the correct/current data
- For FORMAT changes: suggest formats that let users find answers faster
- For META/TECHNICAL: write the exact meta description or tag to use
- The user should be able to sit down and WRITE without researching anything else

${BRIEF_OUTPUT_RULES}

${BRIEF_SCHEMA_BLOCK}

${JSON_RULES}`;
}

export default { buildDiagnosisPrompt, buildBriefPrompt } satisfies PromptVersion;
