import { NextResponse } from "next/server";
import { z } from "zod";
import { resend, FROM_EMAIL } from "@/lib/email";

// No hardcoded fallback: if ADMIN_EMAIL is unset, the route refuses instead
// of silently delivering to a default inbox.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const contactSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().max(200),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(2000),
});

// Simple in-memory rate limit: 3 per email per hour
const rateMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(email);

  if (!entry || now > entry.resetAt) {
    rateMap.set(email, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }

  if (entry.count >= 3) return true;

  entry.count++;
  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input. Please check your fields." },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    if (isRateLimited(email)) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 }
      );
    }

    if (!ADMIN_EMAIL) {
      console.error("[contact] ADMIN_EMAIL not configured — refusing to send");
      return NextResponse.json(
        { error: "Contact form is not configured." },
        { status: 503 }
      );
    }

    const emailSubject = `[SerpVive Contact] ${subject || "New message"} from ${name || email}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: emailSubject,
      text: `New contact form submission:

Name: ${name || "Not provided"}
Email: ${email}
Subject: ${subject || "Not provided"}

Message:
${message}`,
    });

    return NextResponse.json({ data: "Message sent successfully." });
  } catch (err) {
    console.error("[api/contact] Error:", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
