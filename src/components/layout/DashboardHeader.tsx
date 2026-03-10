"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { LogOut, Globe, ChevronDown, Check } from "lucide-react";
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
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-[#16A34A]",
  importing: "bg-[#D97706]",
  paused: "bg-[#6B7280]",
  error: "bg-[#DC2626]",
};

export default function DashboardHeader({ sites, activeSiteId, userEmail }: DashboardHeaderProps) {
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const activeSite = sites.find((s) => s.id === activeSiteId) ?? sites[0] ?? null;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function handleSiteChange(siteId: string) {
    document.cookie = `active_site_id=${siteId};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    router.refresh();
  }

  const initials = userEmail.charAt(0).toUpperCase();
  const hasMultipleSites = sites.length > 1;

  return (
    <header className="h-12 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6">
      <div>
        {activeSite ? (
          hasMultipleSites ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium text-[#111827] hover:text-[#3B82F6] transition-colors rounded-md px-2 py-1 -ml-2 hover:bg-[#F3F4F6] outline-none">
                <Globe size={14} strokeWidth={1.5} className="text-[#6B7280]" />
                {activeSite.domain}
                <ChevronDown size={14} strokeWidth={1.5} className="text-[#9CA3AF]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {sites.map((site) => (
                  <DropdownMenuItem
                    key={site.id}
                    onClick={() => handleSiteChange(site.id)}
                    className="flex items-center gap-3 py-2.5 cursor-pointer"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[site.status] ?? "bg-[#6B7280]"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{site.domain}</p>
                    </div>
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
            <div className="flex items-center gap-2 text-sm font-medium text-[#111827]">
              <Globe size={14} strokeWidth={1.5} className="text-[#6B7280]" />
              {activeSite.domain}
            </div>
          )
        ) : (
          <span className="text-sm text-[#6B7280]">No site connected</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[#3B82F6] text-white text-xs font-semibold flex items-center justify-center">
          {initials}
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          className="text-[#9CA3AF] hover:text-[#111827] transition-colors"
        >
          <LogOut size={16} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
