import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStripe, getPlanFromPriceIdAsync } from "@/lib/stripe";

export async function POST() {
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

    let plan = subscription.metadata?.plan;
    if (!plan && priceId) {
      plan = await getPlanFromPriceIdAsync(priceId);
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    console.log(`[stripe/sync-plan] Synced: user=${user.id}, plan=${plan}, status=${planStatus}`);

    return NextResponse.json({
      data: { plan, planStatus, synced: true },
    });
  } catch (err) {
    // Subscription deleted or not found — downgrade to free
    console.log("[stripe/sync-plan] Subscription not found, downgrading to free:", err);

    await admin
      .from("profiles")
      .update({
        plan: "free",
        plan_status: "active",
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
