import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  let dbStatus = "connected";

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("profiles").select("id").limit(1);
    if (error) dbStatus = "error";
  } catch {
    dbStatus = "error";
  }

  return NextResponse.json({
    status: dbStatus === "connected" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: "1.0.0",
  });
}
