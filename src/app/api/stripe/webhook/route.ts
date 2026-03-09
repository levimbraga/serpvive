import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
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

      const plan = subscription?.metadata?.plan ?? "starter";

      await admin
        .from("profiles")
        .update({
          plan,
          plan_status: "active",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

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
        trialing: "trialing",
        canceled: "canceled",
        unpaid: "past_due",
      };

      const planStatus = statusMap[subscription.status] ?? "active";
      const plan = subscription.metadata?.plan ?? "starter";

      await admin
        .from("profiles")
        .update({
          plan,
          plan_status: planStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

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
          plan: "trial",
          plan_status: "canceled",
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      console.log(`[stripe/webhook] subscription.deleted: user=${userId}`);
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

  return NextResponse.json({ received: true });
}

async function getSubscriptionUserId(stripe: Stripe, subscriptionId: string): Promise<string | undefined> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription.metadata?.supabase_user_id;
}
