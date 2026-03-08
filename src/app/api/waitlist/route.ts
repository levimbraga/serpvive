import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const WaitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  source: z.string().optional().default("landing"),
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const referer = request.headers.get("referer") ?? undefined;
    const parsed = WaitlistSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid input.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { email } = parsed.data;
    const source = parsed.data.source || referer || "landing";

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("waitlist")
      .insert({ email, source });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email is already on the waitlist.", code: "DUPLICATE" },
          { status: 409 }
        );
      }
      console.error("[waitlist] Supabase error:", error);
      return NextResponse.json({ error: "Failed to join waitlist." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
