import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export async function DELETE() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Get profile to check for Stripe subscription
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  // Cancel Stripe subscription + scrub PII from customer (keep customer for tax/dispute compliance)
  if (profile?.stripe_customer_id) {
    try {
      const stripe = getStripe();

      if (profile.stripe_subscription_id) {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id);
        console.log(`[account/delete] Canceled subscription ${profile.stripe_subscription_id}`);
      }

      // Clear PII but preserve the customer object for invoice/tax records
      await stripe.customers.update(profile.stripe_customer_id, {
        name: "",
        email: "",
        phone: "",
        description: "[deleted user]",
        metadata: { deleted: "true", deleted_at: new Date().toISOString() },
      });
      console.log(`[account/delete] Scrubbed PII from Stripe customer ${profile.stripe_customer_id}`);
    } catch (err) {
      console.error("[account/delete] Stripe cleanup error:", err);
    }
  }

  // Get all user's site IDs for cascading deletes
  const { data: userSites } = await admin
    .from("sites")
    .select("id")
    .eq("user_id", user.id);

  const siteIds = (userSites ?? []).map((s) => s.id);

  if (siteIds.length > 0) {
    // Get all page IDs across all sites
    const { data: userPages } = await admin
      .from("pages")
      .select("id")
      .in("site_id", siteIds);

    const pageIds = (userPages ?? []).map((p) => p.id);

    if (pageIds.length > 0) {
      // Delete leaf tables first (reverse dependency order)
      // Batch in chunks of 100 to avoid query size limits
      for (let i = 0; i < pageIds.length; i += 100) {
        const batch = pageIds.slice(i, i + 100);

        const results = await Promise.allSettled([
          admin.from("page_metrics_daily").delete().in("page_id", batch),
          admin.from("page_queries").delete().in("page_id", batch),
        ]);
        for (const r of results) {
          if (r.status === "rejected") console.error("[account/delete] Leaf delete error:", r.reason);
        }
      }
    }

    // Delete refreshes, diagnoses, and external analyses by user_id
    const [refreshErr, diagErr, extErr] = await Promise.allSettled([
      admin.from("refreshes").delete().eq("user_id", user.id),
      admin.from("diagnoses").delete().eq("user_id", user.id),
      admin.from("external_analyses").delete().eq("user_id", user.id),
    ]);
    if (refreshErr.status === "rejected") console.error("[account/delete] Refreshes error:", refreshErr.reason);
    if (diagErr.status === "rejected") console.error("[account/delete] Diagnoses error:", diagErr.reason);
    if (extErr.status === "rejected") console.error("[account/delete] External analyses error:", extErr.reason);

    // Delete pages
    if (pageIds.length > 0) {
      for (let i = 0; i < pageIds.length; i += 100) {
        const batch = pageIds.slice(i, i + 100);
        const { error } = await admin.from("pages").delete().in("id", batch);
        if (error) console.error("[account/delete] Pages delete error:", error);
      }
    }

    // Delete sites
    const { error: sitesErr } = await admin.from("sites").delete().eq("user_id", user.id);
    if (sitesErr) console.error("[account/delete] Sites delete error:", sitesErr);
  }

  // Unlink demo analyses (public, keep but remove creator reference)
  await admin.from("demo_analyses").update({ created_by: null }).eq("created_by", user.id);

  // Delete profile (cascades to any remaining FKs)
  const { error: profileErr } = await admin.from("profiles").delete().eq("id", user.id);
  if (profileErr) console.error("[account/delete] Profile delete error:", profileErr);

  // Delete auth user (this also cascades to profiles if ON DELETE CASCADE exists)
  const { error: authErr } = await admin.auth.admin.deleteUser(user.id);

  if (authErr) {
    console.error("[account/delete] Auth delete error:", authErr);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }

  console.log(`[account/delete] Deleted account ${user.id} (${user.email})`);

  return NextResponse.json({ data: { deleted: true } });
}
