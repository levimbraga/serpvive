import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "SerpVive",
  robots: { index: false, follow: false },
};

// Public signups are disabled during the pre-launch waitlist phase.
// Anyone hitting /signup is redirected to the landing page, where the
// waitlist modal lives. Accounts are created manually via Supabase for now.
export default function SignupPage() {
  redirect("/");
}
