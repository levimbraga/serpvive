import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Placeholder — will be implemented with Resend integration
  // This cron will:
  // 1. Find users with digest_day matching today
  // 2. For each user, compile: health score change, new critical pages, refresh results
  // 3. Send weekly digest email via Resend

  console.log("[cron/send-digests] Placeholder — Resend integration pending");

  return NextResponse.json({
    data: { sent: 0, message: "Resend integration pending" },
  });
}
