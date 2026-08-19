import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import DemoClient from "@/components/admin/DemoClient";
import { isAdmin } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Demo Generator — SerpVive",
};

export default async function AdminDemoPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    redirect("/dashboard");
  }

  return <DemoClient />;
}
