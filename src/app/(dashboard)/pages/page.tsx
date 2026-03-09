import type { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PagesTable from "@/components/pages/PagesTable";

export const metadata: Metadata = {
  title: "Pages — SerpVive",
};

export default async function PagesListPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's active site
  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-[#6B7280]">No active site found.</p>
      </div>
    );
  }

  const { data: pages } = await supabase
    .from("pages")
    .select("id, url, path, status, current_clicks_28d, peak_clicks_monthly, decay_score, decay_velocity_7d, decay_velocity_28d, primary_keyword, primary_position, last_diagnosis_at, updated_at")
    .eq("site_id", site.id)
    .order("decay_score", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#111827] mb-4">Pages</h1>
      <PagesTable pages={pages ?? []} />
    </div>
  );
}
