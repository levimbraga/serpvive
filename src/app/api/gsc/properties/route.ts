import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { listProperties } from "@/lib/gsc/client";

export async function GET() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("gsc_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "GSC not connected. Please authorize first." }, { status: 403 });
  }

  try {
    const properties = await listProperties(accessToken);
    return NextResponse.json({ data: properties });
  } catch (err) {
    console.error("[gsc/properties] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to list properties";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
