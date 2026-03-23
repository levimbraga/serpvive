import type { AIProvider } from "./providers";
import { createClaudeProvider } from "./providers/claude";
import { createGeminiProvider } from "./providers/gemini";
import { createOpenAIProvider } from "./providers/openai";

/**
 * Builds the diagnosis fallback chain in priority order.
 * Only includes providers whose API keys are configured.
 *
 * Order:
 *  1. Claude Opus 4.6  (primary, best quality)
 *  2. Claude Sonnet 4.6 (same provider, cheaper/faster)
 *  3. Gemini 2.5 Pro    (different provider entirely)
 *  4. GPT-4o            (last resort, different infrastructure)
 */
export function getDiagnosisChain(): AIProvider[] {
  const chain: AIProvider[] = [];

  if (process.env.ANTHROPIC_API_KEY) {
    chain.push(createClaudeProvider("claude-opus-4-6"));
    chain.push(createClaudeProvider("claude-sonnet-4-6"));
  }

  if (process.env.GOOGLE_GEMINI_API_KEY) {
    chain.push(createGeminiProvider("gemini-2.5-pro"));
  }

  if (process.env.OPENAI_API_KEY) {
    chain.push(createOpenAIProvider("gpt-4o"));
  }

  return chain;
}
