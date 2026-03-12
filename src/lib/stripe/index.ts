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

/** Reverse lookup: Stripe price_id → plan name (checks both monthly and annual) */
export function getPlanFromPriceId(priceId: string): string {
  for (const [key, config] of Object.entries(STRIPE_PLANS)) {
    if (config.priceId === priceId || config.annualPriceId === priceId) return key;
  }
  console.error(`[stripe] Unknown price_id: ${priceId}. Known:`, JSON.stringify(
    Object.fromEntries(Object.entries(STRIPE_PLANS).map(([k, v]) => [k, { monthly: v.priceId, annual: v.annualPriceId }]))
  ));
  return "starter";
}
