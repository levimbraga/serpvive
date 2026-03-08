"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Settings, Zap } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/pages", icon: FileText, label: "Pages" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

type SidebarProps = {
  diagnosesUsed: number;
  diagnosesLimit: number;
};

export default function Sidebar({ diagnosesUsed, diagnosesLimit }: SidebarProps) {
  const pathname = usePathname();
  const usagePercent = diagnosesLimit > 0 ? Math.min((diagnosesUsed / diagnosesLimit) * 100, 100) : 0;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[60px] bg-[#0F172A] border-r border-[#1E293B] flex flex-col items-center py-4 z-50">
      <Link href="/dashboard" className="mb-6">
        <span className="text-[18px] font-extrabold text-white tracking-tight">S<span className="text-[#3B82F6]">V</span></span>
      </Link>

      <nav className="flex flex-col items-center gap-1 flex-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                isActive
                  ? "bg-[#1E293B] text-white"
                  : "text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E293B]"
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
            </Link>
          );
        })}
      </nav>

      <div className="mb-2" title={`${diagnosesUsed}/${diagnosesLimit} diagnoses used`}>
        <div className="w-8 h-8 flex items-center justify-center relative">
          <Zap size={16} strokeWidth={1.5} className="text-[#64748B]" />
          <svg className="absolute inset-0" viewBox="0 0 32 32">
            <circle
              cx="16" cy="16" r="14"
              fill="none"
              stroke="#1E293B"
              strokeWidth="2"
            />
            <circle
              cx="16" cy="16" r="14"
              fill="none"
              stroke={usagePercent >= 90 ? "#EF4444" : usagePercent >= 70 ? "#F59E0B" : "#3B82F6"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${(usagePercent / 100) * 88} 88`}
              transform="rotate(-90 16 16)"
            />
          </svg>
        </div>
      </div>
    </aside>
  );
}
