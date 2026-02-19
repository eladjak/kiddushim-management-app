
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";

interface EmptyEventsStateProps {
  canCreateEvents: boolean;
  onCreateEvent: () => void;
}

export const EmptyEventsState = ({ canCreateEvents, onCreateEvent }: EmptyEventsStateProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-900/20 p-8 mb-6">
      <EmptyState
        illustration="events"
        title="עדיין אין אירועים"
        description={
          canCreateEvents
            ? "כרגע אין אירועים במערכת. התחל ליצור אירועים חדשים בלחיצה על כפתור 'אירוע חדש'"
            : "כרגע אין אירועים במערכת. אירועים חדשים יופיעו כאן כאשר יתווספו על ידי מנהל או רכז"
        }
      >
        {canCreateEvents && (
          <Button onClick={onCreateEvent} size="lg" className="px-6">
            <Plus className="h-5 w-5 me-2" />
            צור אירוע ראשון
          </Button>
        )}
      </EmptyState>
    </div>
  );
};
