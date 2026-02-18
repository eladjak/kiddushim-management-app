import { Skeleton } from "@/components/ui/skeleton";

export const ReportCardSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
    <Skeleton className="h-5 w-44" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex justify-end pt-2">
      <Skeleton className="h-8 w-28" />
    </div>
  </div>
);

export const ReportsGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <ReportCardSkeleton key={i} />
    ))}
  </div>
);

export const ReportsTableSkeleton = () => (
  <div className="border rounded-lg overflow-hidden">
    {/* Header */}
    <div className="bg-muted/50 p-4 flex gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {[1, 2, 3, 4, 5].map((row) => (
      <div key={row} className="p-4 flex gap-4 border-t">
        {[1, 2, 3, 4, 5].map((col) => (
          <Skeleton key={col} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);
