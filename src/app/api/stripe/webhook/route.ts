import { NextResponse } from "next/server";
import { getStripe, resolvePlanFromPriceId } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPostHogServer } from "@/lib/posthog/server";
import type Stripe from "stripe";

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

  console.log(`[stripe/webhook] ── Event: ${event.type} ──`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      console.log("[stripe/webhook] checkout.session.completed:", {
        customerId,
        subscriptionId,
        mode: session.mode,
      });

      const userId = subscriptionId
        ? (await getSubscriptionUserId(stripe, subscriptionId))
        : session.metadata?.supabase_user_id;

      if (!userId) {
        // Fallback: find user by customer ID
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!profile) {
          console.error("[stripe/webhook] CRITICAL: No user found for checkout session. customerId:", customerId);
          break;
        }

        console.log(`[stripe/webhook] Found user by customer_id fallback: ${profile.id}`);
        await processCheckout(admin, stripe, profile.id, customerId, subscriptionId);
        break;
      }

      await processCheckout(admin, stripe, userId, customerId, subscriptionId);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items?.data?.[0]?.price?.id;
      const customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.toString() ?? "";

      console.log("[stripe/webhook] subscription.updated:", {
        customerId,
        subscriptionId: subscription.id,
        status: subscription.status,
        priceId,
        metadataUserId: subscription.metadata?.supabase_user_id,
        metadataPlan: subscription.metadata?.plan,
      });

      // Find user: try metadata first, then customer_id lookup
      let userId = subscription.metadata?.supabase_user_id;

      if (!userId && customerId) {
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          userId = profile.id;
          console.log(`[stripe/webhook] Found user by customer_id fallback: ${userId}`);
        }
      }

      if (!userId) {
        console.error("[stripe/webhook] CRITICAL: No user found for subscription.updated. customerId:", customerId);
        break;
      }

      // Resolve plan: ALWAYS use price_id (metadata may be stale from original checkout)
      let plan: string | undefined;
      if (priceId) {
        plan = await resolvePlanFromPriceId(priceId);
      }
      if (!plan) {
        plan = subscription.metadata?.plan;
      }
      plan = plan || "starter";

      const statusMap: Record<string, string> = {
        active: "active",
        past_due: "past_due",
        trialing: "active",
        canceled: "canceled",
        unpaid: "past_due",
      };
      const planStatus = statusMap[subscription.status] ?? "active";

      console.log(`[stripe/webhook] Updating profile: user=${userId}, plan=${plan}, status=${planStatus}`);

      const { error: updateError } = await admin
        .from("profiles")
        .update({
          plan,
          plan_status: planStatus,
          stripe_subscription_id: subscription.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error(`[stripe/webhook] CRITICAL: Failed to update profile:`, updateError);
      } else {
        console.log(`[stripe/webhook] SUCCESS: user=${userId} updated to plan=${plan}, status=${planStatus}`);
      }

      // Handle downgrade: pause excess sites
      const planLimits = await import("@/lib/constants").then((m) => m.PLAN_LIMITS);
      const siteLimit = planLimits[plan as keyof typeof planLimits]?.sites ?? 1;

      const { data: userSites } = await admin
        .from("sites")
        .select("id, status")
        .eq("user_id", userId)
        .order("last_sync_at", { ascending: false, nullsFirst: false });

      if (userSites && userSites.length > siteLimit) {
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

      getPostHogServer().capture({ distinctId: userId, event: "plan_changed", properties: { plan, planStatus } });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.toString() ?? "";

      let userId = subscription.metadata?.supabase_user_id;

      if (!userId && customerId) {
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          userId = profile.id;
          console.log(`[stripe/webhook] subscription.deleted: found user by customer_id: ${userId}`);
        }
      }

      if (!userId) {
        console.error("[stripe/webhook] CRITICAL: No user found for subscription.deleted. customerId:", customerId);
        break;
      }

      const { error: deleteError } = await admin
        .from("profiles")
        .update({
          plan: "free",
          plan_status: "active",
          free_since: new Date().toISOString(),
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (deleteError) {
        console.error(`[stripe/webhook] CRITICAL: Failed to downgrade profile:`, deleteError);
      }

      // Pause excess sites (free plan = 1 site)
      const { PLAN_LIMITS } = await import("@/lib/constants");
      const freeSiteLimit = PLAN_LIMITS.free.sites;

      const { data: userSites } = await admin
        .from("sites")
        .select("id, status")
        .eq("user_id", userId)
        .order("last_sync_at", { ascending: false, nullsFirst: false });

      if (userSites && userSites.filter((s) => s.status === "active").length > freeSiteLimit) {
        const activeSites = userSites.filter((s) => s.status === "active");
        const sitesToPause = activeSites.slice(freeSiteLimit);

        for (const s of sitesToPause) {
          await admin.from("sites").update({ status: "paused" }).eq("id", s.id);
        }

        if (sitesToPause.length > 0) {
          console.log(`[stripe/webhook] Paused ${sitesToPause.length} excess sites on cancellation for user=${userId}`);
        }
      }

      getPostHogServer().capture({ distinctId: userId, event: "plan_downgraded", properties: { plan: "free" } });
      console.log(`[stripe/webhook] SUCCESS: user=${userId} downgraded to free`);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

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

async function processCheckout(
  admin: SupabaseClient,
  stripe: Stripe,
  userId: string,
  customerId: string,
  subscriptionId: string,
) {
  const subscription = subscriptionId
    ? await stripe.subscriptions.retrieve(subscriptionId)
    : null;

  // ALWAYS resolve from price_id first (metadata may be stale)
  let plan: string | undefined;
  if (subscription?.items?.data?.[0]?.price?.id) {
    plan = await resolvePlanFromPriceId(subscription.items.data[0].price.id);
  }
  if (!plan) {
    plan = subscription?.metadata?.plan;
  }
  plan = plan || "starter";

  console.log(`[stripe/webhook] processCheckout: user=${userId}, plan=${plan}`);

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      plan,
      plan_status: "active",
      free_since: null,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) {
    console.error(`[stripe/webhook] CRITICAL: Failed to update profile on checkout:`, updateError);
  } else {
    console.log(`[stripe/webhook] SUCCESS: checkout complete for user=${userId}, plan=${plan}`);
  }

  // Reactivate paused sites
  await admin
    .from("sites")
    .update({ status: "active" })
    .eq("user_id", userId)
    .eq("status", "paused");

  getPostHogServer().capture({ distinctId: userId, event: "plan_upgraded", properties: { plan } });
}
