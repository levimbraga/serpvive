import { getSupabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { ExternalLink, Clock } from "lucide-react";

type ExternalAnalysesListProps = {
  userId: string;
  timeZone: string;
};

export default async function ExternalAnalysesList({ userId, timeZone }: ExternalAnalysesListProps) {
  const supabase = await getSupabaseServer();

  const { data: analyses } = await supabase
    .from("external_analyses")
    .select("id, url, keyword, created_at, diagnosis")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!analyses || analyses.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-[#111827]">Your Analyses</h2>
        <Link
          href="/pages/analyze"
          className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium"
        >
          Analyze another URL &rarr;
        </Link>
      </div>
      <div className="space-y-2">
        {analyses.map((a) => {
          const diag = a.diagnosis as { summary?: string } | null;
          return (
            <Link
              key={a.id}
              href={`/pages/analyze/${a.id}`}
              className="block bg-white rounded-xl border border-[#E5E7EB] hover:border-[#3B82F6] p-4 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ExternalLink size={14} strokeWidth={1.5} className="text-[#6B7280] flex-shrink-0" />
                    <p className="text-sm font-medium text-[#111827] truncate">
                      {a.url}
                    </p>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-1">
                    Keyword: {a.keyword}
                  </p>
                  {diag?.summary && (
                    <p className="text-xs text-[#9CA3AF] line-clamp-1">
                      {diag.summary}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-[#9CA3AF] flex-shrink-0">
                  <Clock size={12} strokeWidth={1.5} />
                  {new Date(a.created_at).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", timeZone,
                  })}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
