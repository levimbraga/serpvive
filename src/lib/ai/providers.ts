// ── AI Provider Abstraction ──
// Shared types for the multi-provider fallback chain.
// Each provider (Claude, Gemini, OpenAI) implements AIProvider.

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AICallOptions = {
  maxTokens: number;
  temperature: number;
  timeout?: number; // ms, default 120_000
};

export type AICallResult = {
  text: string;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  latencyMs: number;
};

export type AIProvider = {
  name: string;
  model: string;
  call: (messages: AIMessage[], options: AICallOptions) => Promise<AICallResult>;
};
