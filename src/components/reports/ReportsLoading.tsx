import { ReportsGridSkeleton } from "@/components/skeletons/ReportCardSkeleton";

export const ReportsLoading = () => {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">טוען דיווחים...</span>
      <ReportsGridSkeleton />
    </div>
  );
};
