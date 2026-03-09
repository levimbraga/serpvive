import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Top section: Health Score + Usage */}
      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Health Score ring skeleton */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="w-[200px] h-[200px] rounded-full" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>

        {/* Usage + engine info skeleton */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="w-28 h-4" />
              <Skeleton className="w-16 h-4" />
            </div>
            <Skeleton className="w-20 h-7" />
            <Skeleton className="w-full h-2 rounded-full" />
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-2">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-32 h-5" />
            <Skeleton className="w-28 h-10 rounded-xl mt-2" />
          </div>
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="w-10 h-6" />
              <Skeleton className="w-16 h-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Decay list skeleton */}
      <div>
        <Skeleton className="w-40 h-6 mb-3" />
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <Skeleton className="w-full h-4" />
          </div>
          {/* Rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5 border-b border-[#F3F4F6] flex items-center gap-4">
              <Skeleton className="w-2 h-2 rounded-full flex-shrink-0" />
              <Skeleton className="flex-1 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-6 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
