type Cause = {
  title: string;
  description: string;
  severity: string;
  evidence: string;
  category: string;
};

type DiagnosisData = {
  summary: string;
  topic_coverage?: {
    covered: number;
    total: number;
    percentage: number;
    missing: string[];
  };
  causes: Cause[];
  serp_analysis: {
    top_competitors: { url: string; title: string; strengths: string[] }[];
    intent_type: string;
    content_format_trend: string;
  };
};

type BriefAction = {
  priority: string;
  title: string;
  description: string;
  effort_minutes: number;
  category: string;
  micro_draft: {
    type: string;
    suggestions: string[];
    competitor_references?: string[];
  };
};

type BriefData = {
  total_effort_hours: number;
  actions: BriefAction[];
};

export type AnalysisPageData = {
  url: string;
  path: string;
  keyword: string | null;
  clicks28d: number;
  impressions28d: number;
  position: number | null;
};

/**
 * Formats a diagnosis + brief as Markdown optimized for LLM context.
 * Designed to be pasted into Claude Code or similar AI tools.
 */
export function formatAnalysisMarkdown(
  page: AnalysisPageData,
  diagnosis: DiagnosisData,
  brief: BriefData | null,
  analysisDate: string,
): string {
  const lines: string[] = [];

  // Header
  lines.push(`# Content Analysis: ${page.url}`);
  lines.push(`**Keyword:** ${page.keyword ?? "—"}`);
  lines.push(
    `**Date:** ${new Date(analysisDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`,
  );
  lines.push(
    `**Position:** #${page.position ?? "—"} | **Clicks (28d):** ${page.clicks28d} | **Impressions:** ${page.impressions28d}`,
  );
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push(diagnosis.summary);
  lines.push("");

  // Topic Coverage
  if (diagnosis.topic_coverage) {
    const tc = diagnosis.topic_coverage;
    lines.push(`## Topic Coverage: ${tc.covered} / ${tc.total} (${tc.percentage}%)`);
    if (tc.missing.length > 0) {
      lines.push(`**Missing topics:** ${tc.missing.join(", ")}`);
    }
    lines.push("");
  }

  // Causes
  lines.push(`## Causes Found (${diagnosis.causes.length})`);
  lines.push("");

  diagnosis.causes.forEach((cause, i) => {
    lines.push(`### ${i + 1}. ${cause.title}`);
    lines.push(
      `**Severity:** ${cause.severity} | **Category:** ${cause.category.replace(/_/g, " ")}`,
    );
    lines.push(cause.description);
    lines.push("");
    lines.push(`**Evidence:** ${cause.evidence}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  });

  // SERP Analysis
  lines.push("## SERP Analysis");
  lines.push(`**Intent:** ${diagnosis.serp_analysis.intent_type}`);
  lines.push(
    `**Format trend:** ${diagnosis.serp_analysis.content_format_trend}`,
  );
  lines.push("");

  if (diagnosis.serp_analysis.top_competitors.length > 0) {
    lines.push("### Top Competitors");
    diagnosis.serp_analysis.top_competitors.forEach((comp, i) => {
      lines.push(`${i + 1}. **${comp.url}** — ${comp.title}`);
      comp.strengths.forEach((s) => {
        lines.push(`   - ${s}`);
      });
    });
    lines.push("");
  }

  // Refresh Brief
  if (brief) {
    lines.push(
      `## Refresh Brief (Est. ${brief.total_effort_hours}h)`,
    );
    lines.push("");

    brief.actions.forEach((action, i) => {
      lines.push(`### Action ${i + 1}: ${action.title}`);
      lines.push(
        `**Priority:** ${action.priority.replace(/_/g, " ")} | **Effort:** ${action.effort_minutes}min | **Category:** ${action.category}`,
      );
      lines.push(action.description);
      lines.push("");

      if (action.micro_draft.suggestions.length > 0) {
        lines.push(
          `**Micro-draft (${action.micro_draft.type.replace(/_/g, " ")}):**`,
        );
        action.micro_draft.suggestions.forEach((s) => {
          lines.push(`- ${s}`);
        });
        lines.push("");
      }

      if (
        action.micro_draft.competitor_references &&
        action.micro_draft.competitor_references.length > 0
      ) {
        lines.push("**Competitor references:**");
        action.micro_draft.competitor_references.forEach((r) => {
          lines.push(`- ${r}`);
        });
        lines.push("");
      }

      lines.push("---");
      lines.push("");
    });
  }

  return lines.join("\n");
}

/**
 * Formats a diagnosis + brief as pretty-printed JSON.
 * Excludes internal fields (cost, tokens, processing time).
 */
export function formatAnalysisJson(
  page: AnalysisPageData,
  diagnosis: DiagnosisData,
  brief: BriefData | null,
  analysisDate: string,
): string {
  return JSON.stringify(
    {
      url: page.url,
      path: page.path,
      keyword: page.keyword,
      clicks_28d: page.clicks28d,
      impressions_28d: page.impressions28d,
      position: page.position,
      analysis_date: analysisDate,
      diagnosis,
      refresh_brief: brief,
    },
    null,
    2,
  );
}

/**
 * Builds a download filename from a page path and date.
 * Example: analysis-blog-sempervivum-care-guide-2026-03-14
 */
export function buildExportFilename(
  path: string,
  date: string,
  ext: "md" | "json",
): string {
  const slug = path
    .replace(/^\//, "")
    .replace(/\//g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .slice(0, 60) || "page";
  const dateStr = new Date(date).toISOString().slice(0, 10);
  return `analysis-${slug}-${dateStr}.${ext}`;
}
