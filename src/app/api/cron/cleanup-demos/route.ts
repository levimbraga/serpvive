import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  // Verify cron secret (Vercel crons include this header)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Hard-delete demos older than 90 days (expired demos are kept for conversion)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("demo_analyses")
    .delete()
    .lt("created_at", ninetyDaysAgo)
    .select("id");

  const deletedCount = data?.length ?? 0;

  if (error) {
    console.error("[cron/cleanup-demos] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[cron/cleanup-demos] Deleted ${deletedCount} demos older than 90 days`);
  return NextResponse.json({ data: { deleted: deletedCount } });
}
