import { Skeleton } from "@/components/ui/skeleton";

export const QuickActionSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-2">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  </div>
);

export const UpcomingEventSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-4 w-20" />
    </div>
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-4 w-32" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Welcome */}
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-10 w-full max-w-md" />

    {/* Quick actions */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <QuickActionSkeleton key={i} />
      ))}
    </div>

    {/* Upcoming events */}
    <div className="space-y-4">
      <Skeleton className="h-7 w-32" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <UpcomingEventSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);
