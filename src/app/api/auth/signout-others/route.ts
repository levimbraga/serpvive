import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Sign out all other sessions except the current one
  const { error } = await admin.auth.admin.signOut(user.id, "others");

  if (error) {
    console.error("[auth/signout-others] Failed:", error);
    return NextResponse.json({ error: "Failed to sign out other devices" }, { status: 500 });
  }

  return NextResponse.json({ data: { ok: true } });
}
