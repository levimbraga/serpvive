import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

// ─────────────────────────────────────────────────────────────────────────
// PAYMENTS DISABLED — public version.
// Monetization is designed and integrated (Stripe checkout, portal,
// webhooks, plan sync), but deliberately switched off: every account runs
// on the free tier with usage caps instead of paywalls. The code below is
// kept intact so the billing design remains reviewable; this early return
// is the only change needed to re-enable it.
// ─────────────────────────────────────────────────────────────────────────
const PAYMENTS_DISABLED: boolean = true;

export async function POST(request: Request) {

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
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const stripe = getStripe();
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const appUrl = origin.replace(/\/$/, "");

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${appUrl}/settings`,
  });

  return NextResponse.json({ data: { url: session.url } });
}
