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

// ── Global spend cap ──
// AI_SPEND_CAP_USD sets a ceiling on total lifetime AI spend across the whole
// deployment. Unset or unparseable = no cap. Every table that records an AI
// cost is summed: diagnoses, external_analyses and demo_analyses.
//
// Two deliberate properties:
//
// 1. It is approximate, not a hard barrier. A call's cost is only known after
//    it finishes, so a run that starts under the cap always ends above it. The
//    60s cache below bounds the overshoot to whatever fits in a minute, which
//    the per-hour rate limit and concurrency check already keep to a run or two.
//
// 2. It fails OPEN. If the count query errors, the call proceeds and the
//    failure is logged. A budget guard must not become a single point of
//    failure: a Postgres hiccup should not take down every AI feature, and the
//    downside of fail-open is a few dollars while fail-closed is an outage.

export class AiSpendCapExceededError extends Error {
  constructor(spent: number, cap: number) {
    super(`AI spend cap reached: $${spent.toFixed(2)} of $${cap.toFixed(2)}`);
    this.name = "AiSpendCapExceededError";
  }
}

const SPEND_CACHE_TTL_MS = 60_000;
let spendCache: { total: number; at: number } | null = null;

async function getTotalSpendUsd(): Promise<number | null> {
  const now = Date.now();
  if (spendCache && now - spendCache.at < SPEND_CACHE_TTL_MS) {
    return spendCache.total;
  }

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const admin = getSupabaseAdmin();

    const [d, e, m] = await Promise.all([
      admin.from("diagnoses").select("cost_usd"),
      admin.from("external_analyses").select("cost_usd"),
      admin.from("demo_analyses").select("cost_usd"),
    ]);

    if (d.error || e.error || m.error) {
      console.error("[AI spend cap] Query failed, allowing call:", d.error ?? e.error ?? m.error);
      return null;
    }

    const sum = (rows: { cost_usd: number | string | null }[] | null) =>
      (rows ?? []).reduce((acc, r) => acc + Number(r.cost_usd ?? 0), 0);

    const total = sum(d.data) + sum(e.data) + sum(m.data);
    spendCache = { total, at: now };
    return total;
  } catch (err) {
    console.error("[AI spend cap] Lookup threw, allowing call:", err);
    return null;
  }
}

async function assertUnderSpendCap(): Promise<void> {
  const raw = process.env.AI_SPEND_CAP_USD;
  if (!raw) return;

  const cap = Number.parseFloat(raw);
  if (!Number.isFinite(cap) || cap <= 0) return;

  const spent = await getTotalSpendUsd();
  if (spent === null) return; // fail open — see rationale above

  if (spent >= cap) {
    console.warn(`[AI spend cap] Blocked: $${spent.toFixed(2)} >= $${cap.toFixed(2)}`);
    throw new AiSpendCapExceededError(spent, cap);
  }
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

  await assertUnderSpendCap();

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
