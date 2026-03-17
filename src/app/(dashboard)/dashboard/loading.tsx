import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Greeting skeleton */}
      <div className="space-y-1">
        <Skeleton className="w-56 h-6" />
        <Skeleton className="w-64 h-4" />
      </div>

      {/* Top section: Health Score + Usage */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Health Score ring skeleton */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="w-[200px] h-[200px] rounded-full" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>

        {/* Usage + engine info skeleton */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="w-28 h-4" />
              <Skeleton className="w-16 h-4" />
            </div>
            <Skeleton className="w-20 h-7" />
            <Skeleton className="w-full h-2 rounded-full" />
          </div>
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 space-y-2">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-32 h-5" />
            <Skeleton className="w-28 h-10 rounded-lg mt-2" />
          </div>
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center gap-3">
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
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          {/* Header — desktop only */}
          <div className="hidden md:block px-5 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <Skeleton className="w-full h-4" />
          </div>
          {/* Desktop rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="hidden md:flex px-5 py-3.5 border-b border-[#F3F4F6] items-center gap-4">
              <Skeleton className="w-2 h-2 rounded-full flex-shrink-0" />
              <Skeleton className="flex-1 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-6 rounded-full" />
            </div>
          ))}
          {/* Mobile rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[#F3F4F6]">
              <Skeleton className="w-2 h-2 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-24 h-3" />
              </div>
              <Skeleton className="w-14 h-5 rounded-full flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
