/**
 * v3: Competitor Deep-Dive — individual competitor analysis with steal lists.
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

  return `You are an SEO analyst who specializes in competitive intelligence and gap analysis.

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

COMPETITOR-CENTRIC ANALYSIS:

Instead of generic causes, structure your analysis as a detailed comparison with EACH top 3 competitor individually.

For EACH of the top 3 competitors, create a subsection within the causes:

'COMPETITOR #1: [url] (Position #X)'
1. What this competitor does BETTER than your page:
   (list 3-5 specific advantages with evidence)
2. What YOUR page does BETTER than this competitor:
   (find at least 1 thing — even for the #1 result)
3. What you can STEAL/ADAPT from this competitor:
   (2-3 specific, actionable ideas)

After individual analysis, SYNTHESIZE into your causes:
- PATTERNS: What do ALL top 3 have that you don't?
- UNIQUE OPPORTUNITY: What does NO competitor cover that you could own?
- QUICK WINS: Easiest things to copy from competitors (< 30 min each)
- COMPETITIVE MOAT: What's your existing unique advantage to double down on?

The user should finish reading and know EXACTLY what each competitor does, why they rank, and how to beat each one specifically.

RULES:
- Never say "content is outdated." Say exactly what is outdated and what the current data is.
- Every cause MUST have concrete evidence from the SERP or competitor analysis.
- Maximum 5 causes, minimum 1.

${DIAGNOSIS_OUTPUT_RULES}

${DIAGNOSIS_SCHEMA_BLOCK}

${JSON_RULES}`;
}

function buildBriefPrompt(data: PromptData, diagnosis: DiagnosisResult): string {
  return `Based on the diagnosis below, generate a competitor-referenced, actionable refresh brief with micro-drafts.

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

COMPETITOR-REFERENCED ACTIONS:
- Every action must name WHICH competitor inspired it
- Format: 'Competitor #2 (Planet Desert) has a Quick Reference table with 13 plant specs. Create your own version with these columns: [...]'
- Include a 'steal list' — specific elements to replicate from each competitor
- Also include 1-2 actions that NO competitor does (your differentiator)

MICRO-DRAFT RULES:
- For TITLE changes: provide 2-3 specific title suggestions ready to copy
- For NEW SECTIONS: list 3-5 specific topics/subtopics with what each competitor covers
- For OUTDATED FACTS: provide the correct/current data
- For FORMAT changes: suggest specific columns/rows replicating competitor formats
- For META/TECHNICAL: write the exact meta description or tag to use
- The user should be able to sit down and WRITE without researching anything else

${BRIEF_OUTPUT_RULES}

${BRIEF_SCHEMA_BLOCK}

${JSON_RULES}`;
}

export default { buildDiagnosisPrompt, buildBriefPrompt } satisfies PromptVersion;
