import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPostHogServer } from "@/lib/posthog/server";

const MergeSchema = z.object({
  oldPageId: z.string().uuid(),
  newPageId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = MergeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { oldPageId, newPageId } = parsed.data;

  if (oldPageId === newPageId) {
    return NextResponse.json({ error: "Cannot merge a page into itself" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  // Fetch both pages
  const [oldPageRes, newPageRes] = await Promise.all([
    admin.from("pages").select("id, url, path, site_id, status").eq("id", oldPageId).single(),
    admin.from("pages").select("id, url, path, site_id, status").eq("id", newPageId).single(),
  ]);

  if (!oldPageRes.data || !newPageRes.data) {
    return NextResponse.json({ error: "One or both pages not found" }, { status: 404 });
  }

  const oldPage = oldPageRes.data;
  const newPage = newPageRes.data;

  // Verify same site
  if (oldPage.site_id !== newPage.site_id) {
    return NextResponse.json({ error: "Pages must belong to the same site" }, { status: 400 });
  }

  // Verify site ownership
  const { data: site } = await admin
    .from("sites")
    .select("user_id")
    .eq("id", oldPage.site_id)
    .single();

  if (!site || site.user_id !== user.id) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Validate states
  if (oldPage.status === "redirected") {
    return NextResponse.json({ error: "This page has already been redirected" }, { status: 400 });
  }
  if (newPage.status === "redirected") {
    return NextResponse.json({ error: "Cannot merge into a redirected page" }, { status: 400 });
  }

  const mergedAt = new Date().toISOString();

  // Transfer diagnoses and refreshes from old → new
  const [diagResult, refreshResult] = await Promise.all([
    admin.from("diagnoses").update({ page_id: newPageId }).eq("page_id", oldPageId),
    admin.from("refreshes").update({ page_id: newPageId }).eq("page_id", oldPageId),
  ]);

  if (diagResult.error) {
    console.error("[pages/merge] Failed to transfer diagnoses:", diagResult.error);
  }
  if (refreshResult.error) {
    console.error("[pages/merge] Failed to transfer refreshes:", refreshResult.error);
  }

  // Mark old page as redirected
  const { error: oldErr } = await admin
    .from("pages")
    .update({
      status: "redirected",
      redirect_to: newPageId,
      redirect_url: oldPage.url,
      updated_at: mergedAt,
    })
    .eq("id", oldPageId);

  if (oldErr) {
    console.error("[pages/merge] Failed to update old page:", oldErr);
    return NextResponse.json({ error: "Failed to mark old page as redirected" }, { status: 500 });
  }

  // Set merged_from on new page
  const { error: newErr } = await admin
    .from("pages")
    .update({
      merged_from: oldPageId,
      merged_at: mergedAt,
      updated_at: mergedAt,
    })
    .eq("id", newPageId);

  if (newErr) {
    console.error("[pages/merge] Failed to update new page:", newErr);
  }

  console.log(`[pages/merge] Merged: ${oldPage.path} → ${newPage.path} (user=${user.id})`);

  getPostHogServer().capture({
    distinctId: user.id,
    event: "page_merged",
    properties: { old_page_id: oldPageId, new_page_id: newPageId, old_url: oldPage.url, new_url: newPage.url },
  });
  await getPostHogServer().flush();

  return NextResponse.json({
    data: { success: true, oldPageId, newPageId, mergedAt },
  });
}
