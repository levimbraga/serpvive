import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStripe, STRIPE_PLANS, type StripePlanKey } from "@/lib/stripe";

const CheckoutInputSchema = z.object({
  plan: z.enum(["starter", "pro", "agency"]),
  interval: z.enum(["monthly", "annual"]).default("monthly"),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = CheckoutInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planKey = parsed.data.plan as StripePlanKey;
  const interval = parsed.data.interval;
  const planConfig = STRIPE_PLANS[planKey];

  const priceId = interval === "annual" ? planConfig.annualPriceId : planConfig.priceId;

  if (!priceId) {
    return NextResponse.json({ error: "Stripe price not configured for this plan" }, { status: 500 });
  }

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id, stripe_subscription_id, email, plan")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const stripe = getStripe();
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const appUrl = origin.replace(/\/$/, "");

  // If user already has an active subscription, redirect to Customer Portal for plan change
  // This shows proration and requires user confirmation — never change plans silently
  if (profile.stripe_subscription_id && profile.stripe_customer_id) {
    try {
      const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);

      if (subscription.status === "active" || subscription.status === "trialing") {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: profile.stripe_customer_id,
          return_url: `${appUrl}/settings`,
          flow_data: {
            type: "subscription_update",
            subscription_update: {
              subscription: profile.stripe_subscription_id,
            },
          },
        });

        console.log(`[stripe/checkout] Redirecting to portal for plan change: user=${user.id}, from=${profile.plan}, to=${planKey} (${interval})`);
        return NextResponse.json({ data: { url: portalSession.url } });
      }
    } catch (err) {
      // Portal flow_data not configured or subscription issue — fall through to new checkout
      console.log("[stripe/checkout] Could not create portal session, falling through to checkout:", err);
    }
  }

  // Create or reuse Stripe customer
  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings?upgrade=success`,
    cancel_url: `${appUrl}/settings?upgrade=canceled`,
    subscription_data: {
      metadata: { supabase_user_id: user.id, plan: planKey, interval },
    },
  });

  return NextResponse.json({ data: { url: session.url } });
}
