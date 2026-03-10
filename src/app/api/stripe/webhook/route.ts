import { NextResponse } from "next/server";
import { getStripe, STRIPE_PLANS } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPostHogServer } from "@/lib/posthog/server";
import type Stripe from "stripe";

// Reverse lookup: price_id → plan name
function getPlanFromPriceId(priceId: string): string {
  for (const [key, config] of Object.entries(STRIPE_PLANS)) {
    if (config.priceId === priceId) return key;
  }
  return "starter"; // fallback
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe/webhook] Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.subscription
        ? (await getSubscriptionUserId(stripe, session.subscription as string))
        : session.metadata?.supabase_user_id;

      if (!userId) {
        console.error("[stripe/webhook] No user ID in checkout session");
        break;
      }

      // Get subscription to find plan
      const subscription = session.subscription
        ? await stripe.subscriptions.retrieve(session.subscription as string)
        : null;

      // Determine plan from subscription metadata or price_id
      let plan = subscription?.metadata?.plan;
      if (!plan && subscription?.items?.data?.[0]?.price?.id) {
        plan = getPlanFromPriceId(subscription.items.data[0].price.id);
      }
      plan = plan ?? "starter";

      await admin
        .from("profiles")
        .update({
          plan,
          plan_status: "active",
          free_since: null, // Clear free_since on upgrade
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      // Reactivate any paused sites for this user
      await admin
        .from("sites")
        .update({ status: "active" })
        .eq("user_id", userId)
        .eq("status", "paused");

      getPostHogServer().capture({ distinctId: userId, event: "plan_upgraded", properties: { plan } });
      console.log(`[stripe/webhook] checkout.session.completed: user=${userId}, plan=${plan}`);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;

      if (!userId) {
        console.error("[stripe/webhook] No user ID in subscription metadata");
        break;
      }

      const statusMap: Record<string, string> = {
        active: "active",
        past_due: "past_due",
        trialing: "active",
        canceled: "canceled",
        unpaid: "past_due",
      };

      const planStatus = statusMap[subscription.status] ?? "active";

      // Determine plan from metadata or price_id
      let plan = subscription.metadata?.plan;
      if (!plan && subscription.items?.data?.[0]?.price?.id) {
        plan = getPlanFromPriceId(subscription.items.data[0].price.id);
      }
      plan = plan ?? "starter";

      await admin
        .from("profiles")
        .update({
          plan,
          plan_status: planStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      // Handle downgrade: pause excess sites
      const planLimits = await import("@/lib/constants").then((m) => m.PLAN_LIMITS);
      const siteLimit = planLimits[plan as keyof typeof planLimits]?.sites ?? 1;

      const { data: userSites } = await admin
        .from("sites")
        .select("id, status")
        .eq("user_id", userId)
        .order("last_sync_at", { ascending: false, nullsFirst: false });

      if (userSites && userSites.length > siteLimit) {
        // Keep the most recently synced sites active, pause the rest
        const sitesToPause = userSites
          .filter((s) => s.status === "active")
          .slice(siteLimit);

        for (const s of sitesToPause) {
          await admin.from("sites").update({ status: "paused" }).eq("id", s.id);
        }

        if (sitesToPause.length > 0) {
          console.log(`[stripe/webhook] Paused ${sitesToPause.length} excess sites for user=${userId} (limit=${siteLimit})`);
        }
      }

      console.log(`[stripe/webhook] subscription.updated: user=${userId}, status=${planStatus}, plan=${plan}`);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;

      if (!userId) {
        console.error("[stripe/webhook] No user ID in deleted subscription");
        break;
      }

      await admin
        .from("profiles")
        .update({
          plan: "free",
          plan_status: "active", // Free is an active plan
          free_since: new Date().toISOString(),
          stripe_subscription_id: null,
          // Keep stripe_customer_id for reactivation
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      getPostHogServer().capture({ distinctId: userId, event: "plan_downgraded", properties: { plan: "free" } });
      console.log(`[stripe/webhook] subscription.deleted: user=${userId}, downgraded to free`);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Find user by stripe_customer_id
      const { data: profile } = await admin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile) {
        await admin
          .from("profiles")
          .update({
            plan_status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);

        console.log(`[stripe/webhook] invoice.payment_failed: user=${profile.id}`);
      }
      break;
    }

    default:
      console.log(`[stripe/webhook] Unhandled event: ${event.type}`);
  }

  await getPostHogServer().shutdown();
  return NextResponse.json({ received: true });
}

async function getSubscriptionUserId(stripe: Stripe, subscriptionId: string): Promise<string | undefined> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription.metadata?.supabase_user_id;
}
