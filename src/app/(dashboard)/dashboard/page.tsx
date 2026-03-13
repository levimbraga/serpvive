import type { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PLAN_LIMITS } from "@/lib/constants";
import type { PlanName } from "@/lib/constants";
import { getActiveSiteId } from "@/lib/active-site";
import HealthScoreRing from "@/components/dashboard/HealthScoreRing";
import StatsRow from "@/components/dashboard/StatsRow";
import UsageMeter from "@/components/dashboard/UsageMeter";
import DecayList from "@/components/dashboard/DecayList";
import RunEngineButton from "@/components/dashboard/RunEngineButton";
import RecentResults from "@/components/dashboard/RecentResults";
import UpgradeBanner from "@/components/dashboard/UpgradeBanner";
import FreeDiagnosisBanner from "@/components/dashboard/FreeDiagnosisBanner";
import FreePlanBanner from "@/components/dashboard/FreePlanBanner";
import UpgradeSuccessBanner from "@/components/dashboard/UpgradeSuccessBanner";
import OnboardingTour from "@/components/dashboard/OnboardingTour";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Info, AlertTriangle } from "lucide-react";

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

  // Resolve active site from cookie
  const activeSiteId = await getActiveSiteId(supabase, user.id);

  // Fetch profile + active site in parallel
  const [profileRes, siteRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("plan, diagnoses_used_this_month, free_since, timezone, full_name, created_at")
      .eq("id", user.id)
      .single(),
    activeSiteId
      ? supabase
          .from("sites")
          .select("id, domain, health_score, health_score_prev, pages_count, total_content_pages, pages_healthy, pages_warning, pages_critical, pages_dead, last_engine_run_at, last_sync_at, has_free_diagnosis, status, created_at, token_error, welcome_dismissed, free_diag_dismissed")
          .eq("id", activeSiteId)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const profile = profileRes.data;
  const site = siteRes.data;

  const plan = (profile?.plan ?? "free") as PlanName;
  const diagnosesUsed = profile?.diagnoses_used_this_month ?? 0;
  const diagnosesLimit = PLAN_LIMITS[plan]?.diagnoses_per_month ?? 0;
  const tz = profile?.timezone ?? "UTC";

  // No active site → show setup message
  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-semibold text-[#111827] mb-2">Welcome to SerpVive</h1>
        <p className="text-[#4B5563]">Connect your Google Search Console to get started.</p>
      </div>
    );
  }

  // Greeting logic
  const firstName = profile?.full_name?.split(" ")[0] ?? null;
  const isFirstAccess = !site.last_sync_at || (
    profile?.created_at &&
    new Date(profile.created_at).toDateString() === new Date().toDateString()
  );
  const greeting = isFirstAccess
    ? firstName ? `Welcome, ${firstName}!` : "Welcome to SerpVive!"
    : firstName ? `Welcome back, ${firstName}` : "Welcome back";

  const healthScore = site.health_score ?? 0;
  const healthDelta = site.health_score_prev !== null
    ? healthScore - (site.health_score_prev ?? 0)
    : null;

  // Fetch pages for decay list + recent refresh results in parallel
  const [pagesRes, refreshesRes, measuringRes] = await Promise.all([
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
    supabase
      .from("refreshes")
      .select("id, page_id, refreshed_at")
      .eq("user_id", user.id)
      .in("result_status", ["pending", "measuring"])
      .order("refreshed_at", { ascending: false })
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
  const totalContentPages = site.total_content_pages ?? site.pages_count ?? 0;
  const pageLimit = PLAN_LIMITS[plan]?.pages ?? 100;

  // Free diagnosis: find the auto-diagnosed page
  let freeDiagPageId: string | null = null;
  let freeDiagPagePath: string | null = null;
  const isAutoProcessing = site.status === "active" && !site.has_free_diagnosis && hasEngineRun;

  if (site.has_free_diagnosis) {
    const { data: autoDiag } = await supabase
      .from("diagnoses")
      .select("page_id")
      .eq("user_id", user.id)
      .eq("triggered_by", "auto")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (autoDiag) {
      freeDiagPageId = autoDiag.page_id;
      const pg = pages.find((p) => p.id === autoDiag.page_id);
      freeDiagPagePath = pg?.path ?? null;
    }
  }

  // Detect "all new" site — all pages are "new" status
  const allPagesNew = hasEngineRun && pages.length > 0 && pages.every((p) => p.status === "new");

  // Show GSC info banner for sites less than 3 months old
  const siteAgeMs = site.created_at ? Date.now() - new Date(site.created_at).getTime() : Infinity;
  const isRecentSite = siteAgeMs < 90 * 24 * 60 * 60 * 1000; // < 3 months

  return (
    <div className="space-y-6">
      {/* Upgrade success banner */}
      <UpgradeSuccessBanner />

      {/* Free plan banner */}
      {plan === "free" && (
        <FreePlanBanner
          siteStatus={site.status}
          lastSyncAt={site.last_sync_at}
        />
      )}

      {/* GSC disconnection banner */}
      {site.token_error && (
        <Alert className="bg-[#FEF2F2] border-[#FECACA]">
          <AlertTriangle size={16} strokeWidth={1.5} className="text-[#DC2626]" />
          <AlertDescription className="text-[#991B1B]">
            Google Search Console disconnected. Your data may be outdated.{" "}
            <a
              href="/api/auth/google-gsc?redirect=dashboard"
              className="font-medium text-[#DC2626] hover:text-[#991B1B] underline underline-offset-2"
            >
              Reconnect &rarr;
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome card — first visit after onboarding, until engine + diagnosis complete and dismissed */}
      {site.status === "active" && (
        <WelcomeCard
          siteId={site.id}
          domain={site.domain}
          pagesCount={site.pages_count ?? 0}
          hasEngineRun={hasEngineRun}
          hasDiagnosis={!!site.has_free_diagnosis}
          freeDiagPageId={freeDiagPageId}
          freeDiagPagePath={freeDiagPagePath}
          dismissed={site.welcome_dismissed ?? false}
        />
      )}

      {/* Upgrade banner when site has more pages than plan allows */}
      <UpgradeBanner
        totalContentPages={totalContentPages}
        monitoredPages={site.pages_count ?? 0}
        plan={plan}
        pageLimit={pageLimit}
      />

      {/* Free diagnosis banner */}
      {(freeDiagPageId || isAutoProcessing) && (
        <FreeDiagnosisBanner
          siteId={site.id}
          pageId={freeDiagPageId}
          pagePath={freeDiagPagePath}
          isProcessing={isAutoProcessing}
          dismissed={site.free_diag_dismissed ?? false}
        />
      )}

      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">
          {greeting} {isFirstAccess ? "\uD83C\uDF89" : "\uD83D\uDC4B"}
        </h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Here&apos;s how your blog is doing today.
        </p>
      </div>

      {/* Top section: Health Score + Usage */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-6">
        <div data-tour="health-score" className="bg-white rounded-xl border border-[#E5E7EB] p-8 flex items-center justify-center">
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
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: tz,
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
        <div>
          <StatsRow
            totalPages={site.pages_count}
            healthy={site.pages_healthy}
            warning={site.pages_warning}
            critical={site.pages_critical}
            dead={site.pages_dead}
          />
          <p className="text-[10px] text-[#D1D5DB] mt-1.5 flex items-center gap-1">
            <Info size={10} strokeWidth={1.5} />
            Data from Google Search Console (2–3 day delay)
          </p>
        </div>
      )}

      {/* GSC info banner for new sites */}
      {hasEngineRun && isRecentSite && (
        <Alert className="bg-[#EFF6FF] border-[#BFDBFE]">
          <Info size={16} strokeWidth={1.5} className="text-[#2563EB]" />
          <AlertDescription className="text-[#1E40AF]">
            Pages appear here after Google Search Console registers at least 1 impression.
            Recently published pages may take a few days to show up.{" "}
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#2563EB] hover:text-[#1D4ED8] underline underline-offset-2"
            >
              Check indexation status in Google Search Console &rarr;
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Decay list */}
      {hasEngineRun && (
        <div data-tour="decay-list">
          <h2 className="text-lg font-semibold text-[#111827] mb-3">
            {allPagesNew ? "Your pages" : "Pages by urgency"}
          </h2>
          <DecayList pages={pages} isNewSite={allPagesNew} />
        </div>
      )}

      {/* Recent Results — after decay list */}
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
        measuring={(measuringRes.data ?? []).map((m) => {
          const pg = pages.find((p) => p.id === m.page_id);
          return {
            id: m.id,
            pageId: m.page_id,
            pagePath: pg?.path ?? "Unknown page",
            refreshedAt: m.refreshed_at,
          };
        })}
        timeZone={tz}
      />

      {/* Onboarding tour — shows once on first visit */}
      <OnboardingTour />
    </div>
  );
}
