
import { memo, useMemo } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { safeDecodeHebrew } from "@/integrations/supabase/setupStorage";
import { logger } from "@/utils/logger";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    main_time: string;
    location_name: string;
    parasha?: string;
    status?: string;
  };
  isInBreakPeriod: boolean;
}

const STATUS_BORDER_COLORS: Record<string, string> = {
  planned: "border-s-4 border-blue-400",
  published: "border-s-4 border-blue-400",
  ongoing: "border-s-4 border-green-400",
  completed: "border-s-4 border-gray-300",
  canceled: "border-s-4 border-red-300",
  draft: "border-s-4 border-amber-300",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  planned: "bg-blue-400",
  published: "bg-green-500",
  ongoing: "bg-green-400",
  completed: "bg-gray-400",
  canceled: "bg-red-400",
  draft: "bg-amber-400",
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  published: "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200",
  draft: "bg-muted text-muted-foreground",
  planned: "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  ongoing: "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200",
  completed: "bg-muted text-muted-foreground",
  canceled: "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  published: "פורסם",
  draft: "טיוטה",
  planned: "מתוכנן",
  ongoing: "מתרחש",
  completed: "הושלם",
  canceled: "בוטל",
};

const log = logger.createLogger({ component: 'EventCard' });

export const EventCard = memo(({ event, isInBreakPeriod }: EventCardProps) => {
  // Handle potential date formatting issues
  const formattedDate = useMemo(() => {
    try {
      if (!event.main_time) return "תאריך לא זמין";
      return format(new Date(event.main_time), "EEEE, d בMMMM", { locale: he });
    } catch (error) {
      log.error("Error formatting date", { error, date: event.main_time });
      return "תאריך לא זמין";
    }
  }, [event.main_time]);

  const title = useMemo(() => safeDecodeHebrew(event.title), [event.title]);
  const parasha = useMemo(() => event.parasha ? safeDecodeHebrew(event.parasha) : null, [event.parasha]);
  const location = useMemo(() => safeDecodeHebrew(event.location_name), [event.location_name]);

  const statusBorder = isInBreakPeriod
    ? "border-s-4 border-red-300"
    : (event.status ? STATUS_BORDER_COLORS[event.status] ?? "" : "");

  return (
    <div
      id={`event-${event.id}`}
      className={`p-4 rounded-md border bg-card text-card-foreground transition-all duration-200 ${statusBorder} ${
        isInBreakPeriod
          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
          : 'border-border hover:shadow-lg hover:-translate-y-0.5'
      } highlight-event:border-primary highlight-event:bg-primary/5 highlight-event:shadow-md`}
    >
      <div className="text-right">
        <div className="text-sm text-accent font-medium mb-3">
          {formattedDate}
          {isInBreakPeriod && (
            <span className="text-red-600 dark:text-red-400 me-2 font-bold">(בתקופת הפסקה)</span>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        {parasha && (
          <div className="text-sm text-muted-foreground mb-1">פרשת {parasha}</div>
        )}

        <p className="text-sm text-muted-foreground mb-4">{location}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {event.status && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${
              STATUS_BADGE_COLORS[event.status] ?? "bg-yellow-50 text-yellow-700"
            }`}>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                STATUS_DOT_COLORS[event.status] ?? "bg-yellow-400"
              }`} aria-hidden="true" />
              {STATUS_LABELS[event.status] ?? "ממתין לאישור"}
            </span>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Link to={`/events/${event.id}`}>
            <Button variant="outline" size="sm">
              פרטים נוספים
            </Button>
          </Link>
          <Button size="sm" disabled={isInBreakPeriod}>
            הרשמה לאירוע
          </Button>
        </div>
      </div>
    </div>
  );
});

EventCard.displayName = "EventCard";
