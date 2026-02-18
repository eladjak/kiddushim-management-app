import { EventsListSkeleton } from "@/components/skeletons/EventCardSkeleton";

export const EventsLoadingState = () => {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">טוען אירועים...</span>
      <EventsListSkeleton />
    </div>
  );
};
