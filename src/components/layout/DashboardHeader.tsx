"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

type DashboardHeaderProps = {
  siteName: string;
  userEmail: string;
};

export default function DashboardHeader({ siteName, userEmail }: DashboardHeaderProps) {
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = userEmail.charAt(0).toUpperCase();

  return (
    <header className="h-12 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6">
      <div className="text-sm font-medium text-[#111827]">
        {siteName || "No site connected"}
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
