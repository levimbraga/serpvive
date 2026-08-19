"use client";

type UpgradeBannerProps = {
  totalContentPages: number;
  monitoredPages: number;
  plan: string;
  pageLimit: number;
};

export default function UpgradeBanner({ totalContentPages, monitoredPages, plan, pageLimit }: UpgradeBannerProps) {
  if (totalContentPages <= pageLimit) return null;

  return (
    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-5 py-4 flex items-center justify-between gap-4">
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
      <span className="text-xs text-[#B45309] whitespace-nowrap">
        Free usage cap
      </span>
    </div>
  );
}
