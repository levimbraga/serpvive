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
    annualTotal: 290,
    priceId: process.env.STRIPE_PRICE_STARTER ?? "",
    annualPriceId: process.env.STRIPE_PRICE_STARTER_ANNUAL ?? "",
  },
  pro: {
    name: "Pro",
    price: 69,
    annualPrice: 58,
    annualTotal: 690,
    priceId: process.env.STRIPE_PRICE_PRO ?? "",
    annualPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL ?? "",
  },
  agency: {
    name: "Agency",
    price: 129,
    annualPrice: 108,
    annualTotal: 1290,
    priceId: process.env.STRIPE_PRICE_AGENCY ?? "",
    annualPriceId: process.env.STRIPE_PRICE_AGENCY_ANNUAL ?? "",
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;

/**
 * Hardcoded price ID → plan mapping.
 * This is the bulletproof fallback when env vars are missing or wrong.
 * Includes both current and legacy prices from the Stripe Dashboard.
 */
const KNOWN_PRICE_IDS: Record<string, string> = {
  // Starter
  "price_1T97lJLxIzb11hGRTsBlc6sW": "starter",  // monthly $29
  "price_1TABV3LxIzb11hGRQ8bbW8xK": "starter",  // annual $290

  // Pro
  "price_1T9BehLxIzb11hGRt4JMmdPd": "pro",      // monthly $69
  "price_1TABV4LxIzb11hGRlFGdOl27": "pro",      // annual $690
  "price_1T97lKLxIzb11hGRnhv01Z4E": "pro",      // legacy monthly $59

  // Agency
  "price_1T9BeiLxIzb11hGRk7Whmltb": "agency",   // monthly $129
  "price_1TABV4LxIzb11hGRW10lkSuU": "agency",   // annual $1290
  "price_1T97lKLxIzb11hGRFU6644Ux": "agency",   // legacy monthly $99
};

/** Product name → plan key mapping for Stripe API fallback */
const PRODUCT_NAME_TO_PLAN: Record<string, string> = {
  starter: "starter",
  pro: "pro",
  agency: "agency",
};

/**
 * Resolve Stripe price_id → plan name.
 * Checks: 1) env vars, 2) hardcoded map, 3) Stripe API fallback.
 */
export async function resolvePlanFromPriceId(priceId: string): Promise<string> {
  // 1. Try env var match
  for (const [key, config] of Object.entries(STRIPE_PLANS)) {
    if (config.priceId === priceId || config.annualPriceId === priceId) {
      console.log(`[stripe] Resolved price_id=${priceId} → plan="${key}" via env vars`);
      return key;
    }
  }

  // 2. Try hardcoded map (bulletproof — works even with no env vars)
  const hardcoded = KNOWN_PRICE_IDS[priceId];
  if (hardcoded) {
    console.log(`[stripe] Resolved price_id=${priceId} → plan="${hardcoded}" via hardcoded map`);
    return hardcoded;
  }

  // 3. Fallback: ask Stripe API for the product behind this price
  console.warn(`[stripe] price_id=${priceId} not in env vars or hardcoded map — querying Stripe API`);
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
