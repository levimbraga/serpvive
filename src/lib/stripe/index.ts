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

/** Product name → plan key mapping for Stripe API fallback */
const PRODUCT_NAME_TO_PLAN: Record<string, string> = {
  starter: "starter",
  pro: "pro",
  agency: "agency",
};

/** Reverse lookup: Stripe price_id → plan name (checks both monthly and annual) */
export function getPlanFromPriceId(priceId: string): string {
  for (const [key, config] of Object.entries(STRIPE_PLANS)) {
    if (config.priceId === priceId || config.annualPriceId === priceId) return key;
  }
  console.warn(`[stripe] getPlanFromPriceId: no env var match for price_id=${priceId}. Known:`, JSON.stringify(
    Object.fromEntries(Object.entries(STRIPE_PLANS).map(([k, v]) => [k, { monthly: v.priceId, annual: v.annualPriceId }]))
  ));
  return "";
}

/**
 * Async version: tries env var match first, then falls back to Stripe API
 * to retrieve the product and resolve plan by product name.
 */
export async function getPlanFromPriceIdAsync(priceId: string): Promise<string> {
  // 1. Try local env var match
  const localMatch = getPlanFromPriceId(priceId);
  if (localMatch) return localMatch;

  // 2. Fallback: ask Stripe for the product behind this price
  try {
    const stripe = getStripe();
    const price = await stripe.prices.retrieve(priceId);
    const productId = typeof price.product === "string" ? price.product : price.product?.toString();

    if (productId) {
      const product = await stripe.products.retrieve(productId);
      const planFromName = PRODUCT_NAME_TO_PLAN[product.name.toLowerCase()];

      if (planFromName) {
        console.log(`[stripe] Resolved price_id=${priceId} → product="${product.name}" → plan="${planFromName}" via API fallback`);
        return planFromName;
      }

      // Check product metadata as last resort
      if (product.metadata?.plan) {
        console.log(`[stripe] Resolved price_id=${priceId} → plan="${product.metadata.plan}" via product metadata`);
        return product.metadata.plan;
      }

      console.warn(`[stripe] Product "${product.name}" (${productId}) does not map to any known plan`);
    }
  } catch (err) {
    console.error(`[stripe] Failed to resolve price_id=${priceId} via Stripe API:`, err);
  }

  console.error(`[stripe] Could not resolve price_id=${priceId} — defaulting to "starter"`);
  return "starter";
}
