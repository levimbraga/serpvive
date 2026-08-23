/**
 * Maps an internal pipeline error message to something a user can act on.
 *
 * Shared by /api/diagnose and /api/analyze-url. It used to live inside the
 * diagnose route only, so the standalone-URL route reported *every* failure as
 * the generic sentence below — a page too short to analyze, an AI provider
 * outage and a malformed model response all looked identical, and none of them
 * told the user what to change.
 *
 * The final fallback keeps the "credit was not consumed" wording, which is only
 * true when the run failed before anything was written. Callers that fail after
 * persisting a result must not use it.
 */
export function getUserFriendlyError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("ai_disabled") || lower.includes("kill switch") || lower.includes("disabled via ai_disabled")) {
    return "AI analysis is temporarily disabled in this public version.";
  }
  if (lower.includes("spend cap")) {
    return "AI analysis is paused: this public version has a spending cap and it has been reached.";
  }
  // validateContent() already phrases this for the user — pass it through
  // rather than flattening it into "something went wrong".
  if (lower.includes("too little content")) {
    return message;
  }
  if (lower.includes("page not found")) {
    return "This page could not be found. It may have been removed from your site.";
  }
  if (lower.includes("all ai providers failed")) {
    return "AI analysis is temporarily unavailable. Please try again in a few minutes.";
  }
  if (lower.includes("overloaded") || lower.includes("529") || lower.includes("capacity")) {
    return "Our AI service is temporarily overloaded. Please try again in a few minutes.";
  }
  if (lower.includes("rate") || lower.includes("429") || lower.includes("too many")) {
    return "Too many requests. Please wait a minute and try again.";
  }
  if (lower.includes("timeout") || lower.includes("timed out") || lower.includes("econnrefused")) {
    return "The analysis timed out. This can happen with very large pages. Please try again.";
  }
  if (lower.includes("invalid json") || lower.includes("json parse") || lower.includes("unexpected token")) {
    return "The AI returned an unexpected response. Please try again — this is usually a one-time issue.";
  }
  if (lower.includes("failed to save")) {
    return "The analysis completed but could not be saved. Please try again.";
  }
  if (lower.includes("fetch") || lower.includes("network") || lower.includes("enotfound")) {
    return "Could not reach your page or competitor pages. Check that the URL is accessible and try again.";
  }

  return "Something went wrong during the analysis. Your diagnosis credit was not consumed — please try again.";
}
