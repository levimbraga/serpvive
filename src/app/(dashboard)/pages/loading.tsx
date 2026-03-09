import { Skeleton } from "@/components/ui/skeleton";

export default function PagesLoading() {
  return (
    <div>
      <Skeleton className="w-20 h-7 mb-4" />
      <div className="space-y-3">
        <Skeleton className="w-64 h-10 rounded-xl" />
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <Skeleton className="w-full h-4" />
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5 border-b border-[#F3F4F6] flex items-center gap-4">
              <Skeleton className="flex-1 h-4" />
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
