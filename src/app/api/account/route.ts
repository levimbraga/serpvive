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

  // Cancel Stripe subscription if active
  if (profile?.stripe_subscription_id) {
    try {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(profile.stripe_subscription_id);
      console.log(`[account/delete] Canceled subscription ${profile.stripe_subscription_id}`);
    } catch (err) {
      console.error("[account/delete] Stripe cancel error:", err);
      // Continue with deletion even if Stripe fails
    }
  }

  // Delete all sites (CASCADE handles pages, metrics, queries, diagnoses, refreshes)
  const { error: sitesErr } = await admin
    .from("sites")
    .delete()
    .eq("user_id", user.id);

  if (sitesErr) console.error("[account/delete] Sites delete error:", sitesErr);

  // Delete profile
  const { error: profileErr } = await admin
    .from("profiles")
    .delete()
    .eq("id", user.id);

  if (profileErr) console.error("[account/delete] Profile delete error:", profileErr);

  // Delete auth user
  const { error: authErr } = await admin.auth.admin.deleteUser(user.id);

  if (authErr) {
    console.error("[account/delete] Auth delete error:", authErr);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }

  console.log(`[account/delete] Deleted account ${user.id} (${user.email})`);

  return NextResponse.json({ data: { deleted: true } });
}
