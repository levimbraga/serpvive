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
      const waitSec = Math.ceil((cooldownMs - elapsed) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitSec}s before running the engine again.` },
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
