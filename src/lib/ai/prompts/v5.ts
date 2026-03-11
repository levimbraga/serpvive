/**
 * v5: Editorial Complete — deep content quality audit as a senior editor.
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

  return `You are a senior editor and content strategist reviewing an article submission for a major publication — with SEO awareness.

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

EDITORIAL AUDIT — analyze this page as a senior editor:

1. NARRATIVE STRUCTURE:
   - Does the page have a logical flow? (problem → context → solution → action)
   - Is there a clear thesis or main argument?
   - Are transitions between sections smooth or jarring?
   - Does it build on itself or feel like disconnected bullet points?
   - Is there a satisfying conclusion that ties everything together?

2. VOICE AND AUTHORITY:
   - Does the author demonstrate genuine expertise or lived experience?
   - Is there original insight, or is it just rewording what competitors say?
   - Are claims backed by sources, data, or personal anecdotes?
   - Would a reader trust this author? Why or why not?
   - Is there a consistent, recognizable voice throughout?

3. CONTENT COMPLETENESS:
   - Map every subtopic the searcher might need
   - Which are covered, partially covered, or missing entirely?
   - Format as: 'Topics: 4/11 covered (36%) | 2 partially | 5 missing'
   - Is there irrelevant or filler content that should be removed?

4. ENGAGEMENT AND READABILITY:
   - First paragraph: does it hook the reader in 5 seconds?
   - Scannability: can someone skim and get value?
   - Paragraph length: any walls of text?
   - Use of formatting: headers, bold, lists, callouts, tables
   - Does it answer the main question early or bury the answer?

5. DIFFERENTIATION:
   - What makes this page genuinely DIFFERENT from the top 10 results?
   - If nothing: what COULD make it different?
   - Is there a unique angle, original data, personal experience, or format?
   - What is the page's 'unfair advantage' that no competitor can replicate?

The diagnosis should read like a professional editorial review from a content strategist, not a technical SEO checklist.

RULES:
- Never say "content is outdated." Say exactly what is outdated and what the current data is.
- Every cause MUST have concrete evidence from the SERP or competitor analysis.
- Maximum 5 causes, minimum 1.

${DIAGNOSIS_OUTPUT_RULES}

${DIAGNOSIS_SCHEMA_BLOCK}

${JSON_RULES}`;
}

function buildBriefPrompt(data: PromptData, diagnosis: DiagnosisResult): string {
  return `Based on the diagnosis below, generate an editorial-quality, actionable refresh brief with micro-drafts.

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

EDITORIAL ACTIONS:
- Suggest structural rewrites, not just additions
- If sections should be REORDERED for better flow, say so
- If content should be REMOVED (filler, repetition), say so
- Include 'voice notes': how to make the writing more engaging
  Example: 'Your watering section reads like a textbook. Rewrite the opening as: You know that moment when you hover over your String of Pearls with the watering can, wondering if today is the day you finally kill it? Here is how to stop guessing.'
- Suggest a 'hook' for the first paragraph if the current one is weak
- Suggest a 'closer' for the last paragraph if there is no conclusion

MICRO-DRAFT RULES:
- For TITLE changes: provide 2-3 title suggestions that are compelling for humans
- For NEW SECTIONS: write the actual opening sentence ready to use
- For content to REMOVE: quote the specific sentences/paragraphs to cut
- For REWRITING: show a before/after of the specific paragraph
- For META/TECHNICAL: write the exact meta description or tag to use
- The user should be able to sit down and WRITE without researching anything else

${BRIEF_OUTPUT_RULES}

${BRIEF_SCHEMA_BLOCK}

${JSON_RULES}`;
}

export default { buildDiagnosisPrompt, buildBriefPrompt } satisfies PromptVersion;
