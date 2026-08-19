"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import posthog from "posthog-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  LogOut, Menu, LayoutDashboard, FileText, Settings,
  Globe, ChevronDown, Check, Zap, MessageSquare,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
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

type DashboardHeaderProps = {
  sites: SiteItem[];
  activeSiteId: string | null;
  userEmail: string;
  diagnosesUsed: number;
  diagnosesLimit: number;
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-[#16A34A]",
  importing: "bg-[#D97706]",
  paused: "bg-[#6B7280]",
  error: "bg-[#DC2626]",
};

const MOBILE_NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/pages", icon: FileText, label: "Pages" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/feedback", icon: MessageSquare, label: "Feedback" },
];

export default function DashboardHeader({
  sites,
  activeSiteId,
  userEmail,
  diagnosesUsed,
  diagnosesLimit,
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getSupabaseBrowser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeSite = sites.find((s) => s.id === activeSiteId) ?? sites[0] ?? null;
  const hasMultipleSites = sites.length > 1;
  const usagePercent = diagnosesLimit > 0 ? Math.min((diagnosesUsed / diagnosesLimit) * 100, 100) : 0;

  async function handleLogout() {
    posthog.capture("user_logged_out");
    posthog.reset();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function handleSiteChange(siteId: string) {
    if (siteId === activeSiteId) return;
    // Writing document.cookie inside a user-event handler is intentional
    // (site switch persists via cookie, then hard-navigates). The compiler's
    // immutability rule can't see that this is an event handler side effect.
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `active_site_id=${siteId};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    // Hard navigate to dashboard to ensure fresh data for the new site
    window.location.assign("/dashboard");
  }

  const initials = userEmail.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 sm:px-6">
      {/* Mobile: hamburger + logo */}
      <div className="flex items-center gap-3 sm:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="text-[#6B7280] hover:text-[#111827] transition-colors duration-150">
            <Menu size={20} strokeWidth={1.5} />
          </SheetTrigger>
          <SheetContent side="left" showCloseButton={false} className="w-[260px] bg-[#0F172A] border-r border-[#1E293B] p-0 flex flex-col">
            {/* Mobile logo */}
            <div className="px-5 pt-5 pb-3">
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="no-underline">
                <span className="text-xl font-extrabold text-white tracking-tight">
                  Serp<span className="text-[#3B82F6]">Vive</span>
                </span>
              </Link>
            </div>

            {/* Mobile site selector */}
            {activeSite && (
              <div className="px-4 pb-4 border-b border-[#1E293B]">
                {hasMultipleSites ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full flex items-center gap-2 text-[13px] text-[#94A3B8] hover:text-white rounded-md px-2 py-2 hover:bg-[#1E293B] transition-colors duration-150 outline-none truncate">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[activeSite.status] ?? "bg-[#6B7280]"}`} />
                      <span className="truncate flex-1 text-left font-medium">{activeSite.domain}</span>
                      <ChevronDown size={12} strokeWidth={1.5} className="flex-shrink-0 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {sites.map((site) => (
                        <DropdownMenuItem
                          key={site.id}
                          onClick={() => { handleSiteChange(site.id); setMobileOpen(false); }}
                          className="flex items-center gap-3 py-2 cursor-pointer"
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[site.status] ?? "bg-[#6B7280]"}`} />
                          <span className="text-sm truncate flex-1">{site.domain}</span>
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
                )}
              </div>
            )}

            {/* Mobile nav items */}
            <nav className="flex flex-col gap-0.5 flex-1 px-3 pt-4">
              {MOBILE_NAV.map(({ href, icon: Icon, label }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
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
            </nav>

            {/* Mobile usage meter */}
            <div className="px-4 pb-4 pt-3 mt-auto border-t border-[#1E293B]">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={13} strokeWidth={1.5} className={usagePercent >= 80 ? "text-[#F59E0B]" : "text-[#64748B]"} />
                <span className={`text-[13px] font-medium tabular-nums ${usagePercent >= 80 ? "text-[#F59E0B]" : "text-[#94A3B8]"}`}>
                  {diagnosesUsed}/{diagnosesLimit} diagnoses
                </span>
              </div>
              <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usagePercent >= 90 ? "bg-[#EF4444]" : usagePercent >= 80 ? "bg-[#F59E0B]" : "bg-[#3B82F6]"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="no-underline">
          <span className="text-sm font-extrabold text-[#111827] tracking-tight">
            Serp<span className="text-[#3B82F6]">Vive</span>
          </span>
        </Link>
      </div>

      {/* Desktop: static domain display (site switching is in sidebar) */}
      <div className="hidden sm:flex items-center">
        {activeSite && (
          <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
            <Globe size={14} strokeWidth={1.5} />
            <span className="font-medium">{activeSite.domain}</span>
          </div>
        )}
      </div>

      {/* Right: avatar + logout */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[#3B82F6] text-white text-[11px] font-semibold flex items-center justify-center">
          {initials}
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="text-[#9CA3AF] hover:text-[#111827] transition-colors duration-150"
        >
          <LogOut size={16} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
