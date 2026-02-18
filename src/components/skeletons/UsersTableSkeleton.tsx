import { Skeleton } from "@/components/ui/skeleton";

export const UsersTableSkeleton = () => (
  <div className="space-y-4">
    {/* Search bar */}
    <Skeleton className="h-10 w-64" />

    {/* Table */}
    <div className="border rounded-lg overflow-hidden">
      {/* Header row */}
      <div className="bg-muted/50 p-4 flex gap-4">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      {/* Data rows */}
      {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
        <div key={row} className="p-4 flex gap-4 border-t items-center">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  </div>
);
