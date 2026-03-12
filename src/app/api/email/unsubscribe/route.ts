import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe";

const UnsubscribeSchema = z.object({
  uid: z.string().uuid(),
  token: z.string().min(1),
});

/** GET /api/email/unsubscribe?uid=xxx&token=yyy — one-click unsubscribe from emails */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = UnsubscribeSchema.safeParse({
    uid: searchParams.get("uid"),
    token: searchParams.get("token"),
  });

  if (!parsed.success) {
    return new NextResponse(unsubscribePage("Invalid unsubscribe link."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const { uid, token } = parsed.data;

  if (!verifyUnsubscribeToken(uid, token)) {
    return new NextResponse(unsubscribePage("Invalid or expired link."), {
      status: 403,
      headers: { "Content-Type": "text/html" },
    });
  }

  const admin = getSupabaseAdmin();
  await admin
    .from("profiles")
    .update({ email_unsubscribed: true, updated_at: new Date().toISOString() })
    .eq("id", uid);

  console.log(`[email/unsubscribe] User ${uid} unsubscribed`);

  return new NextResponse(
    unsubscribePage("You have been unsubscribed from SerpVive emails. You can re-enable emails in your account settings."),
    { status: 200, headers: { "Content-Type": "text/html" } },
  );
}

/** POST — for authenticated users toggling from Settings */
export async function POST(request: Request) {
  const { getSupabaseServer } = await import("@/lib/supabase/server");
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const schema = z.object({ unsubscribed: z.boolean() });
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  await admin
    .from("profiles")
    .update({
      email_unsubscribed: parsed.data.unsubscribed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  return NextResponse.json({ data: { unsubscribed: parsed.data.unsubscribed } });
}

function unsubscribePage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe — SerpVive</title></head>
<body style="margin:0;padding:0;background:#0A0E1A;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif">
  <div style="text-align:center;padding:40px;max-width:480px">
    <h1 style="font-size:28px;font-weight:800;color:#fff;margin:0 0 8px">Serp<span style="color:#3B82F6">Vive</span></h1>
    <p style="color:#94A3B8;font-size:16px;line-height:1.6;margin:24px 0">${message}</p>
    <a href="https://serpvive.com/dashboard" style="display:inline-block;padding:12px 24px;background:#3B82F6;color:#fff;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px">Go to Dashboard</a>
  </div>
</body>
</html>`;
}
