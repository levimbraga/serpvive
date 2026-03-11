/**
 * Sanitization utilities for AI prompt inputs and outputs.
 * Defense-in-depth against prompt injection and XSS via AI content.
 */

// ── Input Sanitization (before sending to AI) ──

/**
 * Sanitizes external text before injecting into AI prompts.
 * Removes common prompt injection patterns and limits size.
 */
export function sanitizeForPrompt(text: string): string {
  if (!text) return "";

  return (
    text
      // Remove prompt injection patterns
      .replace(
        /ignore (all |any )?(previous |prior )?instructions/gi,
        "[FILTERED]"
      )
      .replace(
        /disregard (all |any )?(previous |prior |above )?instructions/gi,
        "[FILTERED]"
      )
      .replace(
        /forget (all |any )?(previous |prior )?instructions/gi,
        "[FILTERED]"
      )
      .replace(/system prompt/gi, "[FILTERED]")
      .replace(/you are now/gi, "[FILTERED]")
      .replace(/(act|behave|respond) as/gi, "[FILTERED]")
      .replace(/pretend (to be|you are)/gi, "[FILTERED]")
      .replace(
        /output (the |your )?(api|key|token|secret|password|prompt)/gi,
        "[FILTERED]"
      )
      .replace(
        /reveal (the |your )?(api|key|token|secret|password|prompt)/gi,
        "[FILTERED]"
      )
      .replace(
        /show (me )?(the |your )?(api|key|token|secret|password|prompt)/gi,
        "[FILTERED]"
      )
      // Remove JSON-like role injection attempts
      .replace(
        /\{[^}]*"role"\s*:\s*"(system|assistant|user)"[^}]*\}/gi,
        "[FILTERED]"
      )
      // Remove code fences (could contain injection)
      .replace(/```[\s\S]*?```/g, "[CODE_BLOCK_REMOVED]")
      // Limit size (~3750 tokens)
      .slice(0, 15000)
      .trim()
  );
}

/**
 * Sanitizes GSC query strings before injecting into prompts.
 */
export function sanitizeQuery(query: string): string {
  if (!query) return "";
  return query
    .slice(0, 200)
    .replace(/[{}[\]<>]/g, "")
    .trim();
}

// ── Output Sanitization (after receiving from AI) ──

/**
 * Recursively sanitizes AI output strings to remove XSS vectors.
 * Applied after Zod validation, before saving to DB or rendering.
 */
export function sanitizeAiOutput(obj: unknown): unknown {
  if (typeof obj === "string") {
    return obj
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
      .replace(/<object[\s\S]*?<\/object>/gi, "")
      .replace(/<embed[\s\S]*?>/gi, "")
      .replace(/javascript\s*:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/data\s*:\s*text\/html/gi, "");
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeAiOutput);
  }

  if (obj !== null && typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = sanitizeAiOutput(value);
    }
    return cleaned;
  }

  return obj;
}
