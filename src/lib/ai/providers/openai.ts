import OpenAI from "openai";
import type { AIProvider, AIMessage, AICallOptions, AICallResult } from "../providers";

// USD per 1M tokens (short context, standard tier) — source: OpenAI pricing
// docs, verified 2026-08-19. gpt-4o is no longer offered as a text model.
const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-5.6-terra": { input: 2, output: 12 },
};

export function createOpenAIProvider(model: string): AIProvider {
  const pricing = PRICING[model] ?? { input: 2.5, output: 10 };

  return {
    name: model,
    model,
    call: async (messages: AIMessage[], options: AICallOptions): Promise<AICallResult> => {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY not set");

      const start = Date.now();
      const client = new OpenAI({ apiKey });

      // GPT-5.x rejects two parameters the older chat models accepted. Both
      // verified against the live API on 2026-08-19:
      //   max_tokens  → 400 "Unsupported parameter: 'max_tokens' is not
      //                 supported with this model. Use 'max_completion_tokens'
      //                 instead."
      //   temperature → 400 "Unsupported value: 'temperature' does not support
      //                 0 with this model. Only the default (1) value is
      //                 supported."
      // Callers ask for temperature 0 (correct for Claude), so it is dropped
      // here rather than sent and rejected. Legacy models keep both fields.
      const isGpt5Plus = /^gpt-[5-9]/.test(model);

      // OpenAI uses the same message format as our abstraction
      const response = await client.chat.completions.create({
        model,
        ...(isGpt5Plus
          ? { max_completion_tokens: options.maxTokens }
          : { max_tokens: options.maxTokens, temperature: options.temperature }),
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const text = response.choices[0]?.message?.content ?? "";
      const tokensInput = response.usage?.prompt_tokens ?? 0;
      const tokensOutput = response.usage?.completion_tokens ?? 0;
      const costUsd =
        Math.round(
          ((tokensInput * pricing.input + tokensOutput * pricing.output) /
            1_000_000) *
            10000,
        ) / 10000;

      return { text, tokensInput, tokensOutput, costUsd, latencyMs: Date.now() - start };
    },
  };
}
