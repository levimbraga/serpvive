import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import FeedbackClient from "@/components/feedback/FeedbackClient";

export const metadata: Metadata = {
  title: "Send Feedback — SerpVive",
};

export default async function FeedbackPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, plan")
    .eq("id", user.id)
    .single();

  return (
    <FeedbackClient
      email={profile?.email ?? user.email ?? ""}
      plan={profile?.plan ?? "free"}
    />
  );
}
