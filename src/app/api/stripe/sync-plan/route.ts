import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStripe, resolvePlanFromPriceId, resolveIntervalFromPriceId } from "@/lib/stripe";

// ─────────────────────────────────────────────────────────────────────────
// PAYMENTS DISABLED — public version.
// Monetization is designed and integrated (Stripe checkout, portal,
// webhooks, plan sync), but deliberately switched off: every account runs
// on the free tier with usage caps instead of paywalls. The code below is
// kept intact so the billing design remains reviewable; this early return
// is the only change needed to re-enable it.
// ─────────────────────────────────────────────────────────────────────────
const PAYMENTS_DISABLED: boolean = true;

export async function POST() {

  if (PAYMENTS_DISABLED) {
    return NextResponse.json(
      { error: "Payments are not enabled in this public version." },
      { status: 503 },
    );
  }
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_subscription_id, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
  }

  const stripe = getStripe();

  try {
    const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
    const priceId = subscription.items?.data?.[0]?.price?.id;

    // ALWAYS resolve from price_id first (metadata may be stale from original checkout)
    let plan: string | undefined;
    let billingInterval: "monthly" | "annual" = "monthly";
    if (priceId) {
      plan = await resolvePlanFromPriceId(priceId);
      billingInterval = await resolveIntervalFromPriceId(priceId);
    }
    if (!plan) {
      plan = subscription.metadata?.plan;
    }
    plan = plan ?? "starter";

    const statusMap: Record<string, string> = {
      active: "active",
      past_due: "past_due",
      trialing: "active",
      canceled: "canceled",
      unpaid: "past_due",
    };
    const planStatus = statusMap[subscription.status] ?? "active";

    await admin
      .from("profiles")
      .update({
        plan,
        plan_status: planStatus,
        billing_interval: billingInterval,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    console.log(`[stripe/sync-plan] Synced: user=${user.id}, plan=${plan} (${billingInterval}), status=${planStatus}`);

    return NextResponse.json({
      data: { plan, planStatus, billingInterval, synced: true },
    });
  } catch (err) {
    // Subscription deleted or not found — downgrade to free
    console.log("[stripe/sync-plan] Subscription not found, downgrading to free:", err);

    await admin
      .from("profiles")
      .update({
        plan: "free",
        plan_status: "active",
        billing_interval: "monthly",
        free_since: new Date().toISOString(),
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({
      data: { plan: "free", planStatus: "active", synced: true },
    });
  }
}
