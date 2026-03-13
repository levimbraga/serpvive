import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import AnalysisResultView from "@/components/pages/AnalysisResultView";

export const metadata: Metadata = {
  title: "Analysis Result — SerpVive",
};

export default async function ExternalAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: analysis } = await supabase
    .from("external_analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!analysis) notFound();

  return (
    <AnalysisResultView
      url={analysis.url}
      keyword={analysis.keyword}
      diagnosis={analysis.diagnosis as Record<string, unknown>}
      brief={analysis.refresh_brief as Record<string, unknown> | null}
      createdAt={analysis.created_at}
      badge="External URL"
    />
  );
}
