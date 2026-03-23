import OpenAI from "openai";
import type { AIProvider, AIMessage, AICallOptions, AICallResult } from "../providers";

const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.5, output: 10 },
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

      // OpenAI uses the same message format as our abstraction
      const response = await client.chat.completions.create({
        model,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
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
