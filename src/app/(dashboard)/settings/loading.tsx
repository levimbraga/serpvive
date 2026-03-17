import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-3xl space-y-6">
      <Skeleton className="w-24 h-7" />

      {/* Connected Sites */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-12 h-4" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB]">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-40 h-4" />
              <Skeleton className="w-24 h-3" />
            </div>
            <Skeleton className="w-24 h-8 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Account */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 space-y-4">
        <Skeleton className="w-20 h-5" />
        <div className="divide-y divide-[#F3F4F6]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-40 h-8 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Plan & Usage */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-28 h-5" />
          <Skeleton className="w-24 h-5" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#F9FAFB] rounded-lg p-3 space-y-2">
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-12 h-7" />
            </div>
          ))}
        </div>
        <Skeleton className="w-full h-2 rounded-full" />
      </div>
    </div>
  );
}
