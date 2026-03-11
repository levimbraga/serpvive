import { Skeleton } from "@/components/ui/skeleton";

export default function PageDetailLoading() {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Back link + title */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="w-64 h-6" />
      </div>

      {/* Page info card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-48 h-5" />
          <Skeleton className="w-20 h-7 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-20 h-3" />
              <Skeleton className="w-16 h-6" />
            </div>
          ))}
        </div>
        <Skeleton className="w-32 h-10 rounded-xl" />
      </div>

      {/* Diagnosis card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="w-40 h-5" />
        </div>
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#F9FAFB]">
              <Skeleton className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-48 h-4" />
                <Skeleton className="w-full h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brief card */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
        <Skeleton className="w-36 h-5" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[#F3F4F6]">
            <Skeleton className="w-5 h-5 rounded flex-shrink-0" />
            <Skeleton className="flex-1 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
