import { NextResponse } from "next/server";
import { resend, FROM_EMAIL } from "@/lib/email/resend";
import WeeklyDigest from "@/lib/email/templates/weekly-digest";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: "levimaiabraga@gmail.com",
    subject: "SerpVive Test — Weekly Digest",
    react: WeeklyDigest({
      userName: "Levi",
      siteDomain: "succulencare.com",
      healthScore: 72,
      healthScoreDelta: -3,
      urgentPages: [
        { url: "/blog/succulent-care-guide", title: "Succulent Care Guide", decayScore: 45.2, status: "critical" },
        { url: "/blog/best-indoor-plants", title: "Best Indoor Plants 2024", decayScore: 32.1, status: "warning" },
      ],
      recentResults: [
        { url: "/blog/propagation-tips", clicksDeltaPct: 23.5, resultStatus: "success" },
        { url: "/blog/watering-schedule", clicksDeltaPct: -8.2, resultStatus: "declined" },
      ],
      dashboardUrl: "http://localhost:3000/dashboard",
    }),
  });

  if (error) {
    console.error("[test-email] Error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ data, message: "Test email sent to levimaiabraga@gmail.com" });
}
