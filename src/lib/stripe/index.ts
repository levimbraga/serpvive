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
    priceId: process.env.STRIPE_PRICE_STARTER ?? "",
  },
  pro: {
    name: "Pro",
    price: 69,
    priceId: process.env.STRIPE_PRICE_PRO ?? "",
  },
  agency: {
    name: "Agency",
    price: 129,
    priceId: process.env.STRIPE_PRICE_AGENCY ?? "",
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;
