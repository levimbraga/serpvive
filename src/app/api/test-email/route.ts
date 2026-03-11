import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { sendWeeklyDigest } from "@/lib/email/send";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated — login first" }, { status: 401 });
  }

  // Get first active site
  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!site) {
    return NextResponse.json({ error: "No active site found" }, { status: 404 });
  }

  try {
    await sendWeeklyDigest(user.id, site.id);
    return NextResponse.json({ message: "Weekly digest sent with real data" });
  } catch (err) {
    console.error("[test-email] Error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
