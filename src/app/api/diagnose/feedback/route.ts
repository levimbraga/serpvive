import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const FeedbackSchema = z.object({
  diagnosisId: z.string().uuid(),
  feedback: z.enum(["helpful", "not_helpful"]),
  feedbackText: z.string().max(2000).optional(),
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

  const { diagnosisId, feedback, feedbackText } = parsed.data;
  const admin = getSupabaseAdmin();

  // Verify diagnosis belongs to user and get page info
  const { data: diagnosis } = await admin
    .from("diagnoses")
    .select("id, user_id, page_id, diagnosis")
    .eq("id", diagnosisId)
    .single();

  if (!diagnosis || diagnosis.user_id !== user.id) {
    return NextResponse.json({ error: "Diagnosis not found" }, { status: 404 });
  }

  // Save feedback to DB
  await admin
    .from("diagnoses")
    .update({
      feedback,
      feedback_text: feedbackText ?? null,
      feedback_at: new Date().toISOString(),
    })
    .eq("id", diagnosisId);

  // Get context for email
  const [profileRes, pageRes] = await Promise.all([
    admin.from("profiles").select("email, plan").eq("id", user.id).single(),
    admin.from("pages").select("url, primary_keyword").eq("id", diagnosis.page_id).single(),
  ]);

  const profile = profileRes.data;
  const page = pageRes.data;
  const diagData = diagnosis.diagnosis as { summary?: string } | null;
  const summaryPreview = diagData?.summary?.slice(0, 200) ?? "N/A";

  // Send email notification (fire-and-forget — DB save is what matters)
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emoji = feedback === "helpful" ? "\uD83D\uDC4D Helpful" : "\uD83D\uDC4E Not helpful";

    await resend.emails.send({
      from: "SerpVive Feedback <noreply@mail.serpvive.com>",
      to: "levimaiabraga@gmail.com",
      replyTo: profile?.email ?? user.email ?? undefined,
      subject: `[SerpVive Feedback] ${feedback === "helpful" ? "helpful" : "not_helpful"} — ${page?.url ?? "unknown page"}`,
      text: [
        `User: ${profile?.email ?? user.email}`,
        `Plan: ${profile?.plan ?? "free"}`,
        `Page: ${page?.url ?? "N/A"}`,
        `Keyword: ${page?.primary_keyword ?? "N/A"}`,
        `Feedback: ${emoji}`,
        `Comment: ${feedbackText || "No comment"}`,
        `Diagnosis summary: ${summaryPreview}`,
        `Date: ${new Date().toISOString()}`,
      ].join("\n"),
    });
  } catch (err) {
    // Email is nice-to-have — don't fail the request
    console.error("[api/diagnose/feedback] Email send failed:", err);
  }

  return NextResponse.json({ data: { saved: true } });
}
