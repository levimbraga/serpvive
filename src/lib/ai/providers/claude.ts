import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, AIMessage, AICallOptions, AICallResult } from "../providers";

const PRICING: Record<string, { input: number; output: number }> = {
  "claude-opus-4-6": { input: 5, output: 25 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
};

// Reuse a single client per model to avoid re-creating on every call
const clients = new Map<string, Anthropic>();

function getClient(): Anthropic {
  if (!clients.has("default")) {
    clients.set("default", new Anthropic({ maxRetries: 0 }));
  }
  return clients.get("default")!;
}

export function createClaudeProvider(model: string): AIProvider {
  const pricing = PRICING[model] ?? { input: 3, output: 15 };

  return {
    name: model,
    model,
    call: async (messages: AIMessage[], options: AICallOptions): Promise<AICallResult> => {
      const start = Date.now();
      const client = getClient();

      // Anthropic uses a separate `system` parameter instead of system messages
      const systemContent = messages
        .filter((m) => m.role === "system")
        .map((m) => m.content)
        .join("\n");

      const chatMessages = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      const response = await client.messages.create({
        model,
        max_tokens: options.maxTokens,
        ...(systemContent && { system: systemContent }),
        messages: chatMessages,
      });

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      const tokensInput = response.usage.input_tokens;
      const tokensOutput = response.usage.output_tokens;
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
