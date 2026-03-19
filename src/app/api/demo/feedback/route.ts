import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const DemoFeedbackSchema = z.object({
  demoAnalysisId: z.string().min(1),
  helpful: z.boolean(),
  comment: z.string().max(2000).optional(),
  pageUrl: z.string().optional(),
  keyword: z.string().optional(),
});

export async function POST(request: Request) {
  const body = (await request.json()) as unknown;
  const parsed = DemoFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { demoAnalysisId, helpful, comment, pageUrl, keyword } = parsed.data;
  const admin = getSupabaseAdmin();

  // Verify demo exists
  const { data: demo } = await admin
    .from("demo_analyses")
    .select("id")
    .eq("id", demoAnalysisId)
    .single();

  if (!demo) {
    return NextResponse.json({ error: "Demo not found" }, { status: 404 });
  }

  // Insert feedback (unique constraint prevents duplicates)
  const { error: insertError } = await admin
    .from("demo_feedback")
    .insert({
      demo_analysis_id: demoAnalysisId,
      helpful,
      comment: comment?.trim() || null,
      page_url: pageUrl ?? null,
      keyword: keyword ?? null,
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "Feedback already submitted" }, { status: 409 });
    }
    console.error("[api/demo/feedback] Insert error:", insertError);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }

  // Send email notification (fire-and-forget)
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const rating = helpful ? "Helpful" : "Not helpful";

    await resend.emails.send({
      from: "SerpVive Demo <noreply@mail.serpvive.com>",
      to: process.env.ADMIN_EMAIL ?? "",
      subject: `[SerpVive Demo] ${rating} — ${pageUrl ?? "unknown page"}`,
      text: [
        `Page: ${pageUrl ?? "N/A"}`,
        `Keyword: ${keyword ?? "N/A"}`,
        `Demo link: ${process.env.NEXT_PUBLIC_APP_URL ?? "https://serpvive.com"}/demo/${demoAnalysisId}`,
        `Rating: ${rating}`,
        `Comment: ${comment?.trim() || "No comment"}`,
        `Date: ${new Date().toISOString()}`,
      ].join("\n"),
    });
  } catch (err) {
    console.error("[api/demo/feedback] Email send failed:", err);
  }

  return NextResponse.json({ data: { saved: true } });
}
