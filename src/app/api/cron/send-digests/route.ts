import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendWeeklyDigest } from "@/lib/email/send";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const today = DAY_NAMES[new Date().getDay()];

  // Find users whose digest day matches today, have active subscriptions, are on paid plans, and haven't unsubscribed
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, digest_day, plan_status, plan")
    .eq("digest_day", today)
    .eq("plan_status", "active")
    .neq("plan", "free")
    .neq("email_unsubscribed", true);

  if (!profiles || profiles.length === 0) {
    console.log(`[cron/send-digests] No users with digest_day=${today}`);
    return NextResponse.json({ data: { sent: 0, errors: 0 } });
  }

  console.log(`[cron/send-digests] ${profiles.length} users to email (${today})`);

  let sent = 0;
  let errors = 0;
  const MAX_EMAILS = 100; // Resend free tier daily limit

  for (const profile of profiles) {
    if (sent >= MAX_EMAILS) {
      console.log(`[cron/send-digests] Hit daily limit (${MAX_EMAILS}), stopping`);
      break;
    }

    // Get user's active sites
    const { data: sites } = await admin
      .from("sites")
      .select("id")
      .eq("user_id", profile.id)
      .eq("status", "active");

    for (const site of sites ?? []) {
      if (sent >= MAX_EMAILS) break;

      try {
        await sendWeeklyDigest(profile.id, site.id);
        sent++;
      } catch (err) {
        console.error(`[cron/send-digests] Failed for user ${profile.id}, site ${site.id}:`, err);
        errors++;
      }
    }
  }

  console.log(`[cron/send-digests] Done. Sent: ${sent}, Errors: ${errors}`);
  return NextResponse.json({ data: { sent, errors, total: profiles.length } });
}
