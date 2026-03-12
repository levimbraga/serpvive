import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { runEngine } from "@/lib/engine/run-engine";
import { getActiveSiteId } from "@/lib/active-site";

export async function POST() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  // Get active site from cookie
  const activeSiteId = await getActiveSiteId(supabase, user.id);

  if (!activeSiteId) {
    return NextResponse.json(
      { error: "No active site found. Complete onboarding first." },
      { status: 404 },
    );
  }

  const { data: site, error: siteErr } = await admin
    .from("sites")
    .select("id, status, last_engine_run_at")
    .eq("id", activeSiteId)
    .single();

  if (siteErr || !site || site.status !== "active") {
    return NextResponse.json(
      { error: "No active site found. Complete onboarding first." },
      { status: 404 },
    );
  }

  // Cooldown: 5 minutes between runs
  if (site.last_engine_run_at) {
    const lastRun = new Date(site.last_engine_run_at).getTime();
    const cooldownMs = 5 * 60 * 1000;
    const elapsed = Date.now() - lastRun;
    if (elapsed < cooldownMs) {
      // If the engine ran very recently (e.g. auto-run after import), return success
      // instead of blocking — the user doesn't need to know it already ran
      if (elapsed < 60_000) {
        const { data: siteData } = await admin
          .from("sites")
          .select("pages_count")
          .eq("id", site.id)
          .single();
        return NextResponse.json({
          data: { pagesProcessed: siteData?.pages_count ?? 0, alreadyRan: true },
        });
      }
      const waitSec = Math.ceil((cooldownMs - elapsed) / 1000);
      return NextResponse.json(
        { error: `The engine ran recently. Please wait ${waitSec}s before running again.` },
        { status: 429 },
      );
    }
  }

  try {
    const result = await runEngine(admin, site.id);
    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("[api/engine/run] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Engine failed" },
      { status: 500 },
    );
  }
}
