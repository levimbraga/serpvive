import type { AIProvider } from "./providers";
import { createClaudeProvider } from "./providers/claude";
import { createGeminiProvider } from "./providers/gemini";
import { createOpenAIProvider } from "./providers/openai";

/**
 * Builds the diagnosis fallback chain in priority order.
 * Only includes providers whose API keys are configured.
 *
 * Order:
 *  1. Claude Opus 5    (primary, best quality)
 *  2. Claude Sonnet 5  (same provider, cheaper/faster — only helps with
 *                       rate limits and timeouts)
 *  3. Gemini 3.7 Flash (different provider entirely — first link that
 *                       survives an Anthropic outage)
 *  4. GPT-5.6 Terra    (last resort, third infrastructure)
 *
 * Model IDs and per-token pricing verified against each provider's official
 * docs on 2026-08-19.
 *
 * Why gemini-3.7-flash and not gemini-3.1-pro-preview:
 * Google currently ships no *stable* Gemini 3.x Pro — the only Pro-tier
 * option is a preview. Choosing it would buy tier parity with the primary
 * model at the cost of stability, and stability is the entire job of this
 * slot: a preview model can be deprecated on short notice, so the link that
 * exists to survive an outage would itself become the thing most likely to
 * break. A Flash-tier model that reliably answers beats a Pro-tier model
 * that may 404 next quarter. Revisit when a stable Gemini 3.x Pro ships.
 */
export function getDiagnosisChain(): AIProvider[] {
  const chain: AIProvider[] = [];

  if (process.env.ANTHROPIC_API_KEY) {
    chain.push(createClaudeProvider("claude-opus-5"));
    chain.push(createClaudeProvider("claude-sonnet-5"));
  }

  if (process.env.GOOGLE_GEMINI_API_KEY) {
    chain.push(createGeminiProvider("gemini-3.7-flash"));
  }

  if (process.env.OPENAI_API_KEY) {
    chain.push(createOpenAIProvider("gpt-5.6-terra"));
  }

  return chain;
}

/**
 * Builds the brief fallback chain — starts with Sonnet (fast, good enough
 * for transforming diagnosis causes into actionable items).
 *
 * Skips Opus entirely because briefs consistently timed out with it.
 * ⚠️ That was MEASURED ON OPUS 4.6 (March 2026) and has NOT been
 * re-evaluated on Opus 5. The decision is kept because it still holds on
 * its own merits — a brief is a transformation step that doesn't need the
 * strongest model — but treat "Opus times out here" as an unverified claim
 * about the current model, not a fact.
 *
 * Order:
 *  1. Claude Sonnet 5   (primary, fast)
 *  2. Gemini 3.7 Flash  (different provider)
 *  3. GPT-5.6 Terra     (last resort)
 */
export function getBriefChain(): AIProvider[] {
  const chain: AIProvider[] = [];

  if (process.env.ANTHROPIC_API_KEY) {
    chain.push(createClaudeProvider("claude-sonnet-5"));
  }

  if (process.env.GOOGLE_GEMINI_API_KEY) {
    chain.push(createGeminiProvider("gemini-3.7-flash"));
  }

  if (process.env.OPENAI_API_KEY) {
    chain.push(createOpenAIProvider("gpt-5.6-terra"));
  }

  return chain;
}
