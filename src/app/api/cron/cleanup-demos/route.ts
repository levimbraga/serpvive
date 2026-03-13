import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  // Verify cron secret (Vercel crons include this header)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from("demo_analyses")
    .delete()
    .lt("expires_at", new Date().toISOString())
    .select("id");

  const deletedCount = data?.length ?? 0;

  if (error) {
    console.error("[cron/cleanup-demos] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[cron/cleanup-demos] Deleted ${deletedCount} expired demos`);
  return NextResponse.json({ data: { deleted: deletedCount } });
}
