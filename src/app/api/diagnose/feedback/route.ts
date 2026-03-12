import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const FeedbackSchema = z.object({
  diagnosisId: z.string().uuid(),
  feedback: z.enum(["helpful", "not_helpful"]),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsed = FeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { diagnosisId, feedback } = parsed.data;
  const admin = getSupabaseAdmin();

  // Verify diagnosis belongs to user
  const { data: diagnosis } = await admin
    .from("diagnoses")
    .select("id, user_id")
    .eq("id", diagnosisId)
    .single();

  if (!diagnosis || diagnosis.user_id !== user.id) {
    return NextResponse.json({ error: "Diagnosis not found" }, { status: 404 });
  }

  await admin
    .from("diagnoses")
    .update({ feedback })
    .eq("id", diagnosisId);

  return NextResponse.json({ data: { saved: true } });
}
