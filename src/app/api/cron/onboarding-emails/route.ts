import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendOnboardingDay2, sendOnboardingDay5 } from "@/lib/email/send";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const now = new Date();
  let day2Sent = 0;
  let day5Sent = 0;
  let errors = 0;

  // Day 2: users created exactly 2 days ago (still trialing)
  const day2Start = new Date(now);
  day2Start.setDate(day2Start.getDate() - 2);
  day2Start.setHours(0, 0, 0, 0);
  const day2End = new Date(day2Start);
  day2End.setHours(23, 59, 59, 999);

  const { data: day2Users } = await admin
    .from("profiles")
    .select("id, plan_status")
    .gte("created_at", day2Start.toISOString())
    .lte("created_at", day2End.toISOString())
    .eq("plan_status", "trialing");

  for (const user of day2Users ?? []) {
    try {
      await sendOnboardingDay2(user.id);
      day2Sent++;
    } catch (err) {
      console.error(`[cron/onboarding-emails] Day 2 failed for ${user.id}:`, err);
      errors++;
    }
  }

  // Day 5: users created exactly 5 days ago (still trialing)
  const day5Start = new Date(now);
  day5Start.setDate(day5Start.getDate() - 5);
  day5Start.setHours(0, 0, 0, 0);
  const day5End = new Date(day5Start);
  day5End.setHours(23, 59, 59, 999);

  const { data: day5Users } = await admin
    .from("profiles")
    .select("id, plan_status")
    .gte("created_at", day5Start.toISOString())
    .lte("created_at", day5End.toISOString())
    .eq("plan_status", "trialing");

  for (const user of day5Users ?? []) {
    try {
      await sendOnboardingDay5(user.id);
      day5Sent++;
    } catch (err) {
      console.error(`[cron/onboarding-emails] Day 5 failed for ${user.id}:`, err);
      errors++;
    }
  }

  console.log(`[cron/onboarding-emails] Day2: ${day2Sent}, Day5: ${day5Sent}, Errors: ${errors}`);

  return NextResponse.json({
    data: { day2Sent, day5Sent, errors },
  });
}
