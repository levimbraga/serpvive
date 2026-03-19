import type { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getActiveSiteId } from "@/lib/active-site";
import PagesTable from "@/components/pages/PagesTable";
import ExternalAnalysesList from "@/components/dashboard/ExternalAnalysesList";
import { Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Pages — SerpVive",
};

export const revalidate = 60;

export default async function PagesListPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get active site from cookie
  const activeSiteId = await getActiveSiteId(supabase, user.id);
  const site = activeSiteId ? { id: activeSiteId } : null;

  // Fetch timezone
  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();

  const timeZone = profile?.timezone ?? "UTC";

  if (!site) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#111827]">Pages</h1>
          <Link
            href="/pages/analyze"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
          >
            <Zap size={14} strokeWidth={1.5} /> Analyze any page
          </Link>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 text-center">
          <p className="text-[#6B7280] mb-2">No site connected yet.</p>
          <p className="text-sm text-[#9CA3AF]">
            <Link href="/onboarding" className="text-[#3B82F6] hover:text-[#2563EB] font-medium">
              Connect Google Search Console
            </Link>{" "}
            to monitor your pages, or analyze individual URLs above.
          </p>
        </div>
        <ExternalAnalysesList userId={user.id} timeZone={timeZone} />
      </div>
    );
  }

  const { data: pages } = await supabase
    .from("pages")
    .select("id, url, path, status, current_clicks_28d, peak_clicks_monthly, decay_score, decay_velocity_7d, decay_velocity_28d, primary_keyword, primary_position, last_diagnosis_at, updated_at")
    .eq("site_id", site.id)
    .neq("status", "redirected")
    .order("decay_score", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#111827]">Pages</h1>
        <Link
          href="/pages/analyze"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium transition-colors"
        >
          <Zap size={14} strokeWidth={1.5} /> Analyze any page
        </Link>
      </div>
      <PagesTable pages={pages ?? []} timeZone={timeZone} />
      <ExternalAnalysesList userId={user.id} timeZone={timeZone} />
    </div>
  );
}
