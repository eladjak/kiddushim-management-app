import { Skeleton } from "@/components/ui/skeleton";

export const EventCardSkeleton = () => (
  <div className="border rounded-xl p-5 space-y-3">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-4 w-40" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>
  </div>
);

export const EventsListSkeleton = () => (
  <div className="space-y-8">
    {/* Month group skeleton */}
    {[1, 2].map((group) => (
      <div key={group} className="bg-white rounded-lg shadow-sm p-6">
        <Skeleton className="h-7 w-40 mb-4" />
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
          {[1, 2, 3, 4].map((i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    ))}
  </div>
);
