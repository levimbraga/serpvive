import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, AIMessage, AICallOptions, AICallResult } from "../providers";

const PRICING: Record<string, { input: number; output: number }> = {
  "gemini-2.5-pro": { input: 1.25, output: 10 },
};

export function createGeminiProvider(model: string): AIProvider {
  const pricing = PRICING[model] ?? { input: 1.25, output: 10 };

  return {
    name: model,
    model,
    call: async (messages: AIMessage[], options: AICallOptions): Promise<AICallResult> => {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("GOOGLE_GEMINI_API_KEY not set");

      const start = Date.now();
      const genAI = new GoogleGenerativeAI(apiKey);

      // Extract system instruction from system messages
      const systemParts = messages
        .filter((m) => m.role === "system")
        .map((m) => m.content);

      const chatMessages = messages.filter((m) => m.role !== "system");

      const genModel = genAI.getGenerativeModel({
        model,
        ...(systemParts.length > 0 && {
          systemInstruction: systemParts.join("\n"),
        }),
        generationConfig: {
          maxOutputTokens: options.maxTokens,
          temperature: options.temperature,
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
