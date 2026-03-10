"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type UpgradeBannerProps = {
  totalContentPages: number;
  monitoredPages: number;
  plan: string;
  pageLimit: number;
};

export default function UpgradeBanner({ totalContentPages, monitoredPages, plan, pageLimit }: UpgradeBannerProps) {
  if (totalContentPages <= pageLimit) return null;

  return (
    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[#92400E]">
          Your site has {totalContentPages.toLocaleString()} content pages but your{" "}
          <span className="capitalize">{plan}</span> plan monitors the top{" "}
          {pageLimit.toLocaleString()}.
        </p>
        <p className="text-xs text-[#B45309] mt-1">
          Currently monitoring {monitoredPages.toLocaleString()} of {totalContentPages.toLocaleString()} pages (sorted by traffic).
        </p>
      </div>
      <Link
        href="/settings"
        className="flex items-center gap-1 text-sm font-medium text-[#92400E] hover:text-[#78350F] whitespace-nowrap"
      >
        Upgrade
        <ArrowUpRight size={16} strokeWidth={1.5} />
      </Link>
    </div>
  );
}
