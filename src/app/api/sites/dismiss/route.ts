import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  siteId: z.string().uuid(),
  field: z.enum(["welcome_dismissed", "free_diag_dismissed"]),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { siteId, field } = parsed.data;

  const { error } = await supabase
    .from("sites")
    .update({ [field]: true })
    .eq("id", siteId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ data: { ok: true } });
}
