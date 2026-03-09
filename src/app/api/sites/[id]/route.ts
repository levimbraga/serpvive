import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify site belongs to user
  const { data: site } = await supabase
    .from("sites")
    .select("id, domain")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Delete site (CASCADE handles pages, metrics, queries, diagnoses, refreshes)
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("sites").delete().eq("id", id);

  if (error) {
    console.error("[sites/delete] Error:", error);
    return NextResponse.json({ error: "Failed to delete site" }, { status: 500 });
  }

  console.log(`[sites/delete] Deleted site ${site.domain} for user ${user.id}`);

  return NextResponse.json({ data: { deleted: true } });
}
