import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendOnboardingDay2, sendOnboardingDay3 } from "@/lib/email/send";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const now = new Date();
  let day2Sent = 0;
  let day3Sent = 0;
  let errors = 0;

  // Day 2: users created exactly 2 days ago (free plan — nudge engagement)
  const day2Start = new Date(now);
  day2Start.setDate(day2Start.getDate() - 2);
  day2Start.setHours(0, 0, 0, 0);
  const day2End = new Date(day2Start);
  day2End.setHours(23, 59, 59, 999);

  const { data: day2Users } = await admin
    .from("profiles")
    .select("id, plan")
    .gte("created_at", day2Start.toISOString())
    .lte("created_at", day2End.toISOString())
    .eq("plan", "free");

  for (const user of day2Users ?? []) {
    try {
      await sendOnboardingDay2(user.id);
      day2Sent++;
    } catch (err) {
      console.error(`[cron/onboarding-emails] Day 2 failed for ${user.id}:`, err);
      errors++;
    }
  }

  // Day 3: users created exactly 3 days ago (free plan — conversion push)
  const day3Start = new Date(now);
  day3Start.setDate(day3Start.getDate() - 3);
  day3Start.setHours(0, 0, 0, 0);
  const day3End = new Date(day3Start);
  day3End.setHours(23, 59, 59, 999);

  const { data: day3Users } = await admin
    .from("profiles")
    .select("id, plan")
    .gte("created_at", day3Start.toISOString())
    .lte("created_at", day3End.toISOString())
    .eq("plan", "free");

  for (const user of day3Users ?? []) {
    try {
      await sendOnboardingDay3(user.id);
      day3Sent++;
    } catch (err) {
      console.error(`[cron/onboarding-emails] Day 3 failed for ${user.id}:`, err);
      errors++;
    }
  }

  console.log(`[cron/onboarding-emails] Day2: ${day2Sent}, Day3: ${day3Sent}, Errors: ${errors}`);

  return NextResponse.json({
    data: { day2Sent, day3Sent, errors },
  });
}
