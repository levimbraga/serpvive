import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PLAN_LIMITS, type PlanName } from "@/lib/constants";
import { getStripe, resolveIntervalFromPriceId } from "@/lib/stripe";

/**
 * Cron: Apply deferred plan changes (downgrades/cancellations).
 * Runs every hour. Checks profiles where plan_changes_at <= now()
 * and applies the pending_plan.
 */
// PAYMENTS DISABLED — public version. This cron only exists to apply
// deferred Stripe downgrades/cancellations; with payments off it has no
// work to do. Also removed from vercel.json's cron schedule.
const PAYMENTS_DISABLED: boolean = true;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (PAYMENTS_DISABLED) {
    return NextResponse.json({ data: { skipped: "payments disabled in public version" } });
  }

  const admin = getSupabaseAdmin();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, plan, pending_plan, plan_changes_at, stripe_subscription_id")
    .not("pending_plan", "is", null)
    .lte("plan_changes_at", new Date().toISOString());

  if (error) {
    console.error("[cron/apply-plan-changes] Failed to fetch profiles:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ applied: 0 });
  }

  let applied = 0;

  for (const profile of profiles) {
    const newPlan = profile.pending_plan as PlanName;
    const isCancellation = newPlan === "free";

    const updateData: Record<string, unknown> = {
      plan: newPlan,
      plan_status: "active",
      pending_plan: null,
      plan_changes_at: null,
      updated_at: new Date().toISOString(),
    };

    if (isCancellation) {
      updateData.free_since = new Date().toISOString();
      updateData.stripe_subscription_id = null;
      updateData.billing_interval = "monthly";
    } else if (profile.stripe_subscription_id) {
      // Resolve billing interval from the current Stripe subscription
      try {
        const stripe = getStripe();
        const sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
        const priceId = sub.items?.data?.[0]?.price?.id;
        if (priceId) {
          updateData.billing_interval = await resolveIntervalFromPriceId(priceId);
        }
      } catch (err) {
        console.error(`[cron/apply-plan-changes] Failed to resolve interval for user=${profile.id}:`, err);
      }
    }

    const { error: updateError } = await admin
      .from("profiles")
      .update(updateData)
      .eq("id", profile.id);

    if (updateError) {
      console.error(`[cron/apply-plan-changes] Failed to apply for user=${profile.id}:`, updateError);
      continue;
    }

    // Pause excess sites based on new plan limits
    const siteLimit = PLAN_LIMITS[newPlan]?.sites ?? 1;

    const { data: userSites } = await admin
      .from("sites")
      .select("id, status")
      .eq("user_id", profile.id)
      .order("last_sync_at", { ascending: false, nullsFirst: false });

    if (userSites) {
      const activeSites = userSites.filter((s) => s.status === "active");
      const sitesToPause = activeSites.slice(siteLimit);

      for (const s of sitesToPause) {
        await admin.from("sites").update({ status: "paused" }).eq("id", s.id);
      }

      if (sitesToPause.length > 0) {
        console.log(`[cron/apply-plan-changes] Paused ${sitesToPause.length} sites for user=${profile.id}`);
      }
    }

    console.log(`[cron/apply-plan-changes] Applied: user=${profile.id}, ${profile.plan} → ${newPlan}`);
    applied++;
  }

  console.log(`[cron/apply-plan-changes] Done. Applied ${applied} plan changes.`);
  return NextResponse.json({ applied });
}
