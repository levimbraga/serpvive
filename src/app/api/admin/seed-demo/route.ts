import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/constants";
import { seedDemo } from "@/scripts/seed-demo";
import { runEngine } from "@/lib/engine/run-engine";

export const maxDuration = 120;

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const shouldRunEngine = searchParams.get("run_engine") === "true";

  try {
    const result = await seedDemo(admin, user.id);

    let engineResult = null;
    if (shouldRunEngine) {
      console.log("[seed-demo] Running decay engine...");
      engineResult = await runEngine(admin, result.siteId);
      console.log(`[seed-demo] Engine done — health score: ${engineResult.healthScore}`);
    }

    return NextResponse.json({
      data: {
        ...result,
        engineResult: engineResult ? {
          healthScore: engineResult.healthScore,
          pagesHealthy: engineResult.pagesHealthy,
          pagesWarning: engineResult.pagesWarning,
          pagesCritical: engineResult.pagesCritical,
          pagesDead: engineResult.pagesDead,
        } : null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[seed-demo] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
