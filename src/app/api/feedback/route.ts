import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  message: z.string().min(1).max(5000),
});

export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, plan")
    .eq("id", user.id)
    .single();

  // Send via Resend
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "SerpVive Feedback <noreply@mail.serpvive.com>",
      to: process.env.ADMIN_EMAIL ?? "",
      replyTo: profile?.email ?? user.email ?? undefined,
      subject: `[SerpVive Feedback] General — ${profile?.email ?? user.email ?? "user"}`,
      text: `From: ${profile?.email ?? user.email}\nPlan: ${profile?.plan ?? "free"}\n\n${parsed.data.message}`,
    });

    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    console.error("[api/feedback] Failed to send:", err);
    return NextResponse.json({ error: "Failed to send feedback" }, { status: 500 });
  }
}
