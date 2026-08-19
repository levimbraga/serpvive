import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, AIMessage, AICallOptions, AICallResult } from "../providers";

// USD per 1M tokens (<=200k prompts) — source: ai.google.dev/gemini-api/docs/pricing,
// verified 2026-08-19.
//
// gemini-3.7-flash is promotional at $0.75/$3.75 through 2026-12-31 and
// reverts to $1.50/$7.50 on 2027-01-01. Both rates are encoded with the
// switchover date so cost_usd stays correct across it without a code change —
// a single hardcoded promo rate would silently under-report every call made
// from January onward.
const GEMINI_37_FLASH_PROMO_ENDS = Date.parse("2027-01-01T00:00:00Z");

function priceFor(model: string, now: number): { input: number; output: number } {
  if (model === "gemini-3.7-flash") {
    return now < GEMINI_37_FLASH_PROMO_ENDS
      ? { input: 0.75, output: 3.75 }
      : { input: 1.5, output: 7.5 };
  }
  if (model === "gemini-2.5-pro") return { input: 1.25, output: 10 };
  return { input: 1.25, output: 10 };
}

export function createGeminiProvider(model: string): AIProvider {

  return {
    name: model,
    model,
    call: async (messages: AIMessage[], options: AICallOptions): Promise<AICallResult> => {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("GOOGLE_GEMINI_API_KEY not set");

      const start = Date.now();
      const pricing = priceFor(model, start);
      const genAI = new GoogleGenerativeAI(apiKey);

      // Extract system instruction from system messages
      const systemParts = messages
        .filter((m) => m.role === "system")
        .map((m) => m.content);

      const chatMessages = messages.filter((m) => m.role !== "system");

      // Gemini 3.x: do NOT send temperature. Google's official guidance is to
      // leave it at the default 1.0 — the callers here ask for temperature 0
      // (right for Claude/OpenAI determinism), and on Gemini 3 a sub-1.0
      // temperature "may lead to unexpected behavior, such as looping or
      // degraded performance". Source: ai.google.dev/gemini-api/docs/gemini-3
      // § Temperature + § Migration from Gemini 2.5, read 2026-08-19.
      // Legacy 2.x models keep honoring the caller's value.
      const isGemini3 = /^gemini-3/.test(model);

      const genModel = genAI.getGenerativeModel({
        model,
        ...(systemParts.length > 0 && {
          systemInstruction: systemParts.join("\n"),
        }),
        generationConfig: {
          maxOutputTokens: options.maxTokens,
          ...(isGemini3 ? {} : { temperature: options.temperature }),
        },
      });

      // Build chat history (all messages except the last one)
      const history = chatMessages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: m.content }],
      }));

      const chat = genModel.startChat({ history });

      const lastMessage = chatMessages[chatMessages.length - 1];
      if (!lastMessage) throw new Error("No messages provided");
      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;
      const text = response.text();

      const usage = response.usageMetadata;
      const tokensInput = usage?.promptTokenCount ?? 0;
      const tokensOutput = usage?.candidatesTokenCount ?? 0;
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
