import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  stripeClient = new Stripe(key, {
    apiVersion: "2026-02-25.clover",
    typescript: true,
  });

  return stripeClient;
}

export const STRIPE_PLANS = {
  starter: {
    name: "Starter",
    price: 29,
    annualPrice: 24,
    annualTotal: 288,
    priceId: process.env.STRIPE_PRICE_STARTER ?? "",
    annualPriceId: process.env.STRIPE_PRICE_STARTER_ANNUAL ?? "",
  },
  pro: {
    name: "Pro",
    price: 69,
    annualPrice: 58,
    annualTotal: 696,
    priceId: process.env.STRIPE_PRICE_PRO ?? "",
    annualPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL ?? "",
  },
  agency: {
    name: "Agency",
    price: 129,
    annualPrice: 108,
    annualTotal: 1296,
    priceId: process.env.STRIPE_PRICE_AGENCY ?? "",
    annualPriceId: process.env.STRIPE_PRICE_AGENCY_ANNUAL ?? "",
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;

/**
 * Resolve Stripe price_id → billing interval ("monthly" | "annual").
 * Checks: 1) env vars (STRIPE_PRICE_* / *_ANNUAL), 2) Stripe API fallback.
 * Price IDs are intentionally NOT hardcoded — they identify account products
 * and belong in environment configuration, not in a public repository.
 */
export async function resolveIntervalFromPriceId(priceId: string): Promise<"monthly" | "annual"> {
  // 1. Check env var match (annualPriceId fields)
  for (const config of Object.values(STRIPE_PLANS)) {
    if (config.annualPriceId === priceId) return "annual";
    if (config.priceId === priceId) return "monthly";
  }

  // 2. Fallback: ask Stripe API
  try {
    const stripe = getStripe();
    const price = await stripe.prices.retrieve(priceId);
    if (price.recurring?.interval === "year") return "annual";
  } catch (err) {
    console.error(`[stripe] Failed to resolve interval for price_id=${priceId}:`, err);
  }

  return "monthly";
}

/** Product name → plan key mapping for Stripe API fallback */
const PRODUCT_NAME_TO_PLAN: Record<string, string> = {
  starter: "starter",
  pro: "pro",
  agency: "agency",
};

/**
 * Resolve Stripe price_id → plan name.
 * Checks: 1) env vars, 2) Stripe API fallback (product metadata, then name).
 */
export async function resolvePlanFromPriceId(priceId: string): Promise<string> {
  // 1. Try env var match
  for (const [key, config] of Object.entries(STRIPE_PLANS)) {
    if (config.priceId === priceId || config.annualPriceId === priceId) {
      console.log(`[stripe] Resolved price_id=${priceId} → plan="${key}" via env vars`);
      return key;
    }
  }

  // 2. Fallback: ask Stripe API for the product behind this price
  console.warn(`[stripe] price_id=${priceId} not in env vars — querying Stripe API`);
  try {
    const stripe = getStripe();
    const price = await stripe.prices.retrieve(priceId);
    const productId = typeof price.product === "string" ? price.product : price.product?.toString();

    if (productId) {
      const product = await stripe.products.retrieve(productId);

      // Check product metadata first
      if (product.metadata?.plan) {
        console.log(`[stripe] Resolved price_id=${priceId} → plan="${product.metadata.plan}" via product metadata`);
        return product.metadata.plan;
      }

      // Match by product name
      const planFromName = PRODUCT_NAME_TO_PLAN[product.name.toLowerCase()];
      if (planFromName) {
        console.log(`[stripe] Resolved price_id=${priceId} → product="${product.name}" → plan="${planFromName}" via API`);
        return planFromName;
      }

      console.error(`[stripe] CRITICAL: Product "${product.name}" (${productId}) does not map to any known plan`);
    }
  } catch (err) {
    console.error(`[stripe] Failed to resolve price_id=${priceId} via Stripe API:`, err);
  }

  console.error(`[stripe] CRITICAL: Could not resolve price_id=${priceId} by any method — defaulting to "starter"`);
  return "starter";
}
