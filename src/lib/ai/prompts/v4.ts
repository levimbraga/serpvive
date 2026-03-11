/**
 * v4: Impact x Effort Framework — prioritizes by ROI.
 */
import type { PromptData, PromptVersion } from "./types";
import type { DiagnosisResult } from "../diagnose";
import v1 from "./v1";

const FRAMEWORK_ADDON = `
PRIORITIZATION FRAMEWORK — score every cause:

Impact Score (1-10):
  10 = Directly explains ranking loss (wrong intent, critical gap)
  7-9 = Major gap (all top 3 have it, user doesn't)
  4-6 = Moderate gap (some competitors have it)
  1-3 = Nice-to-have (only 1 competitor has it)

Ease Score (1-10, higher = easier to fix):
  10 = 5 min fix (change title, update one number)
  7-9 = 30 min fix (add paragraph, create table)
  4-6 = 1-2 hour fix (write new section)
  1-3 = 4+ hour fix (major rewrite)

Priority Score = Impact × Ease
Only include causes with Priority Score >= 20.
Sort by Priority Score descending.
Show in each cause: 'Impact: 9 | Ease: 7 | Priority: 63'`;

const BRIEF_ADDON = `
Sort actions by Priority Score. Show estimated ROI:
'Fix in ~10min → recover ~30 clicks/month'`;

function buildDiagnosisPrompt(data: PromptData): string {
  const base = v1.buildDiagnosisPrompt(data);
  return base.replace(
    "CRITICAL RULES FOR OUTPUT:",
    `${FRAMEWORK_ADDON}\n\nCRITICAL RULES FOR OUTPUT:`,
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
