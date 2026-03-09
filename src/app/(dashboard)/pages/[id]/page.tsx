import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import PageDetailClient from "@/components/pages/PageDetailClient";

export const metadata: Metadata = {
  title: "Page Detail — SerpVive",
};

export default async function PageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch page with site verification
  const { data: page } = await supabase
    .from("pages")
    .select("*, site_id")
    .eq("id", id)
    .single();

  if (!page) notFound();

  // Verify ownership
  const { data: site } = await supabase
    .from("sites")
    .select("user_id, domain")
    .eq("id", page.site_id)
    .single();

  if (!site || site.user_id !== user.id) notFound();

  // Fetch latest diagnosis if exists
  const { data: latestDiagnosis } = await supabase
    .from("diagnoses")
    .select("id, diagnosis, refresh_brief, cost_usd, processing_time_ms, created_at")
    .eq("page_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch plan limits
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, diagnoses_used_this_month")
    .eq("id", user.id)
    .single();

  return (
    <PageDetailClient
      page={page}
      siteDomain={site.domain}
      latestDiagnosis={latestDiagnosis}
      diagnosesUsed={profile?.diagnoses_used_this_month ?? 0}
      diagnosesLimit={
        ({ trial: 3, starter: 10, pro: 50, agency: 150 } as Record<string, number>)[profile?.plan ?? "trial"] ?? 3
      }
    />
  );
}
