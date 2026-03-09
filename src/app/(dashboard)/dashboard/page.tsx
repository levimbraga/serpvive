import type { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PLAN_LIMITS } from "@/lib/constants";
import type { PlanName } from "@/lib/constants";
import HealthScoreRing from "@/components/dashboard/HealthScoreRing";
import StatsRow from "@/components/dashboard/StatsRow";
import UsageMeter from "@/components/dashboard/UsageMeter";
import DecayList from "@/components/dashboard/DecayList";
import RunEngineButton from "@/components/dashboard/RunEngineButton";
import RecentResults from "@/components/dashboard/RecentResults";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — SerpVive",
};

// Revalidate dashboard data every 60 seconds
export const revalidate = 60;

export default async function DashboardPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile + site in parallel
  const [profileRes, siteRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("plan, diagnoses_used_this_month")
      .eq("id", user.id)
      .single(),
    supabase
      .from("sites")
      .select("id, domain, health_score, health_score_prev, pages_count, pages_healthy, pages_warning, pages_critical, pages_dead, last_engine_run_at, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const profile = profileRes.data;
  const site = siteRes.data;

  const plan = (profile?.plan ?? "trial") as PlanName;
  const diagnosesUsed = profile?.diagnoses_used_this_month ?? 0;
  const diagnosesLimit = PLAN_LIMITS[plan]?.diagnoses_per_month ?? 3;

  // No active site → show setup message
  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-semibold text-[#111827] mb-2">Welcome to SerpVive</h1>
        <p className="text-[#4B5563]">Connect your Google Search Console to get started.</p>
      </div>
    );
  }

  const healthScore = site.health_score ?? 0;
  const healthDelta = site.health_score_prev !== null
    ? healthScore - (site.health_score_prev ?? 0)
    : null;

  // Fetch pages for decay list + recent refresh results in parallel
  const [pagesRes, refreshesRes] = await Promise.all([
    supabase
      .from("pages")
      .select("id, path, url, status, current_clicks_28d, decay_score, decay_velocity_7d")
      .eq("site_id", site.id)
      .order("decay_score", { ascending: false }),
    supabase
      .from("refreshes")
      .select("id, page_id, result_status, clicks_delta_pct, refreshed_at, result_calculated_at")
      .eq("user_id", user.id)
      .in("result_status", ["success", "partial", "no_change", "declined"])
      .order("result_calculated_at", { ascending: false })
      .limit(5),
  ]);

  const pagesData = pagesRes.data;

  const pages = (pagesData ?? []).map((p) => ({
    id: p.id,
    path: p.path,
    url: p.url,
    status: p.status as "healthy" | "warning" | "critical" | "dead" | "new" | "unknown",
    currentClicks28d: p.current_clicks_28d,
    decayScore: p.decay_score,
    velocity7d: p.decay_velocity_7d,
  }));

  const hasEngineRun = site.last_engine_run_at !== null;

  // Detect "all new" site — all pages are "new" status
  const allPagesNew = hasEngineRun && pages.length > 0 && pages.every((p) => p.status === "new");

  return (
    <div className="space-y-6">
      {/* Top section: Health Score + Usage */}
      <div className="grid grid-cols-[1fr_300px] gap-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 flex items-center justify-center">
          {hasEngineRun ? (
            <div className="flex flex-col items-center gap-4">
              <HealthScoreRing score={healthScore} delta={healthDelta} />
              {allPagesNew && (
                <div className="flex items-center gap-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-3 max-w-sm">
                  <Sparkles size={18} strokeWidth={1.5} className="text-[#2563EB] flex-shrink-0" />
                  <p className="text-sm text-[#1E40AF]">
                    Your site is new! Decay analysis starts when we have 3+ months of traffic data. You can still analyze individual pages.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#6B7280] mb-4">
                Run the engine to calculate your site&apos;s health score.
              </p>
              <RunEngineButton />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <UsageMeter used={diagnosesUsed} limit={diagnosesLimit} plan={plan} />
          {hasEngineRun && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <p className="text-xs text-[#9CA3AF] mb-1">Last engine run</p>
              <p className="text-sm text-[#111827] font-medium">
                {new Date(site.last_engine_run_at!).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
              <div className="mt-3">
                <RunEngineButton />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      {hasEngineRun && (
        <StatsRow
          totalPages={site.pages_count}
          healthy={site.pages_healthy}
          warning={site.pages_warning}
          critical={site.pages_critical}
          dead={site.pages_dead}
        />
      )}

      {/* Recent Results */}
      {(refreshesRes.data ?? []).length > 0 && (
        <RecentResults
          results={(refreshesRes.data ?? []).map((r) => {
            const pg = pages.find((p) => p.id === r.page_id);
            return {
              id: r.id,
              pageId: r.page_id,
              pagePath: pg?.path ?? "Unknown page",
              resultStatus: r.result_status as "success" | "partial" | "no_change" | "declined",
              clicksDeltaPct: r.clicks_delta_pct,
              resultCalculatedAt: r.result_calculated_at,
            };
          })}
        />
      )}

      {/* Decay list */}
      {hasEngineRun && (
        <div>
          <h2 className="text-lg font-semibold text-[#111827] mb-3">
            {allPagesNew ? "Your pages" : "Pages by urgency"}
          </h2>
          <DecayList pages={pages} isNewSite={allPagesNew} />
        </div>
      )}
    </div>
  );
}
