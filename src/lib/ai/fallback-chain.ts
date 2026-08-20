import type { AIProvider, AIMessage, AICallOptions, AICallResult } from "./providers";

// ── Types ──

export type FallbackAttempt = {
  provider: string;
  error: string;
  latencyMs: number;
};

export type FallbackResult = AICallResult & {
  provider: string;
  fallbackUsed: boolean;
  attempts: FallbackAttempt[];
};

// ── Error class for when all providers fail ──

export class FallbackExhaustedError extends Error {
  attempts: FallbackAttempt[];
  constructor(attempts: FallbackAttempt[]) {
    super("All AI providers failed");
    this.name = "FallbackExhaustedError";
    this.attempts = attempts;
  }
}

// ── Emergency kill switch ──
// Every AI call in the app funnels through runWithFallback(), so a single
// env var (AI_DISABLED=true on Vercel + redeploy) shuts down all paid AI
// calls — diagnoses, briefs, external analyses, demos — without touching
// the rest of the app (dashboard, GSC sync, scoring engine, emails).

export class AiDisabledError extends Error {
  constructor() {
    super("AI calls are disabled via AI_DISABLED env var");
    this.name = "AiDisabledError";
  }
}

function isAiDisabled(): boolean {
  return process.env.AI_DISABLED === "true";
}

// ── Configuration ──

const DEFAULT_TIMEOUT_MS = 120_000; // 2 minutes per attempt
const RETRY_SAME_PROVIDER = 0; // No retry on same provider — fall through to next immediately
const RETRY_DELAY_MS = 2_000; // Brief pause before retry

// ── Error classification ──
// TODO: User implements this — see conversation for guidance

function isNonRetryable(error: string): boolean {
  const lower = error.toLowerCase();
  return (
    lower.includes("401") ||
    lower.includes("403") ||
    lower.includes("invalid_api_key") ||
    lower.includes("invalid api key") ||
    lower.includes("incorrect api key") ||
    lower.includes("authentication") ||
    lower.includes("permission denied") ||
    lower.includes("model_not_found") ||
    lower.includes("model not found") ||
    lower.includes("not set") ||
    lower.includes("billing") ||
    lower.includes("quota exceeded") ||
    lower.includes("invalid_request") ||
    lower.includes("400")
  );
}

// ── Fallback chain runner ──

export async function runWithFallback(
  providers: AIProvider[],
  messages: AIMessage[],
  options: AICallOptions,
): Promise<FallbackResult> {
  if (isAiDisabled()) {
    console.warn("[AI Fallback] Blocked by AI_DISABLED kill switch");
    throw new AiDisabledError();
  }

  if (providers.length === 0) {
    throw new FallbackExhaustedError([]);
  }

  const attempts: FallbackAttempt[] = [];
  const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;

  for (const provider of providers) {
    for (let retry = 0; retry <= RETRY_SAME_PROVIDER; retry++) {
      const start = Date.now();
      try {
        // Race the provider call against a timeout
        const result = await Promise.race([
          provider.call(messages, options),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("TIMEOUT")), timeout),
          ),
        ]);

        return {
          ...result,
          provider: provider.name,
          fallbackUsed: provider !== providers[0],
          attempts,
        };
      } catch (error) {
        const latencyMs = Date.now() - start;
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        attempts.push({ provider: provider.name, error: errorMsg, latencyMs });

        console.error(
          `[AI Fallback] ${provider.name} attempt ${retry + 1} failed:`,
          errorMsg,
        );

        // Skip retries for permanent errors (auth, invalid key, etc.)
        if (isNonRetryable(errorMsg)) break;

        // Brief pause before retrying same provider
        if (retry < RETRY_SAME_PROVIDER) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    }
  }

  throw new FallbackExhaustedError(attempts);
}
