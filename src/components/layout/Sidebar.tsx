"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Settings, Zap, Globe,
  ChevronDown, Check, MessageSquare, Share2, HelpCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SiteItem = {
  id: string;
  domain: string;
  status: string;
  health_score: number | null;
};

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/pages", icon: FileText, label: "Pages" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/feedback", icon: MessageSquare, label: "Feedback" },
];

const STATUS_DOT: Record<string, string> = {
  active: "bg-[#16A34A]",
  importing: "bg-[#D97706]",
  paused: "bg-[#6B7280]",
  error: "bg-[#DC2626]",
};

const PLAN_LABELS: Record<string, string> = {
  free: "FREE",
  starter: "STARTER",
  pro: "PRO",
  agency: "AGENCY",
};

const ADMIN_EMAIL = "levimaiabraga@gmail.com";

type SidebarProps = {
  diagnosesUsed: number;
  diagnosesLimit: number;
  plan?: string;
  sites: SiteItem[];
  activeSiteId: string | null;
  userEmail?: string;
  hasFreeDiagnosis?: boolean;
  hasGsc?: boolean;
  autoDiagStatus?: string;
};

export default function Sidebar({ diagnosesUsed, diagnosesLimit, plan = "free", sites, activeSiteId, userEmail, hasFreeDiagnosis, hasGsc, autoDiagStatus }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const usagePercent = diagnosesLimit > 0 ? Math.min((diagnosesUsed / diagnosesLimit) * 100, 100) : 0;
  const isAdmin = userEmail === ADMIN_EMAIL;

  const activeSite = sites.find((s) => s.id === activeSiteId) ?? sites[0] ?? null;
  const hasMultipleSites = sites.length > 1;

  function handleSiteChange(siteId: string) {
    document.cookie = `active_site_id=${siteId};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[200px] bg-[#0F172A] border-r border-[#1E293B] flex flex-col z-50 hidden sm:flex">
      {/* Logo */}
      <div className="px-5 pt-5 pb-3">
        <Link href="/dashboard" className="no-underline">
          <span className="text-xl font-extrabold text-white tracking-tight">
            Serp<span className="text-[#3B82F6]">Vive</span>
          </span>
        </Link>
      </div>

      {/* Site selector */}
      <div className="px-4 pb-4 border-b border-[#1E293B]">
        {activeSite ? (
          hasMultipleSites ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full flex items-center gap-2 text-[13px] text-[#94A3B8] hover:text-white rounded-md px-2 py-2 hover:bg-[#1E293B] transition-colors duration-150 outline-none truncate">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[activeSite.status] ?? "bg-[#6B7280]"}`} />
                <span className="truncate flex-1 text-left font-medium">{activeSite.domain}</span>
                <ChevronDown size={12} strokeWidth={1.5} className="flex-shrink-0 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="bottom" className="w-56">
                {sites.map((site) => (
                  <DropdownMenuItem
                    key={site.id}
                    onClick={() => handleSiteChange(site.id)}
                    className="flex items-center gap-3 py-2 cursor-pointer"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[site.status] ?? "bg-[#6B7280]"}`} />
                    <span className="text-sm truncate flex-1">{site.domain}</span>
                    {site.health_score !== null && (
                      <span className="text-xs text-[#6B7280] tabular-nums">{site.health_score}</span>
                    )}
                    {site.id === activeSite.id && (
                      <Check size={14} strokeWidth={2} className="text-[#16A34A] flex-shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2 text-[13px] text-[#94A3B8] px-2 py-2 truncate">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[activeSite.status] ?? "bg-[#6B7280]"}`} />
              <span className="truncate font-medium">{activeSite.domain}</span>
            </div>
          )
        ) : (
          <div className="text-[13px] text-[#64748B] px-2 py-2">No site connected</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1 px-3 pt-4">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors duration-150 no-underline ${
                isActive
                  ? "bg-[#1E293B] text-white border-l-[3px] border-[#3B82F6] pl-[9px]"
                  : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin/demo"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors duration-150 no-underline ${
              pathname.startsWith("/admin/demo")
                ? "bg-[#1E293B] text-white border-l-[3px] border-[#3B82F6] pl-[9px]"
                : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
            }`}
          >
            <Share2 size={16} strokeWidth={1.5} />
            Demo
          </Link>
        )}
      </nav>

      {/* Bottom: plan badge + usage meter */}
      <div className="px-4 pb-4 pt-3 border-t border-[#1E293B]">
        {/* Plan badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-bold text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded tracking-wider">
            {PLAN_LABELS[plan] ?? plan.toUpperCase()}
          </span>
        </div>

        {/* Usage */}
        {plan !== "free" && diagnosesLimit > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={13} strokeWidth={1.5} className={usagePercent >= 80 ? "text-[#F59E0B]" : "text-[#64748B]"} />
              <span className={`text-[13px] font-medium tabular-nums ${usagePercent >= 80 ? "text-[#F59E0B]" : "text-[#94A3B8]"}`}>
                {diagnosesUsed}/{diagnosesLimit} diagnoses
              </span>
            </div>
            <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercent >= 90 ? "bg-[#EF4444]" : usagePercent >= 80 ? "bg-[#F59E0B]" : "bg-[#3B82F6]"
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </>
        ) : autoDiagStatus === "failed" && hasGsc && !hasFreeDiagnosis ? (
          <div className="flex items-center gap-2">
            <Zap size={13} strokeWidth={1.5} className="text-[#0D9488]" />
            <Link href="/pages" className="text-[12px] text-[#0D9488] hover:text-[#14B8A6] transition-colors no-underline font-medium">
              1 free diagnosis available
            </Link>
          </div>
        ) : autoDiagStatus === "completed" || (hasGsc && hasFreeDiagnosis) ? (
          <div className="flex items-center gap-2">
            <Zap size={13} strokeWidth={1.5} className="text-[#64748B]" />
            <Link href="/settings" className="text-[12px] text-[#64748B] hover:text-[#94A3B8] transition-colors no-underline">
              Upgrade for AI diagnoses
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Zap size={13} strokeWidth={1.5} className="text-[#64748B]" />
            <Link href="/onboarding" className="text-[12px] text-[#64748B] hover:text-[#94A3B8] transition-colors no-underline">
              Connect GSC to get started
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
