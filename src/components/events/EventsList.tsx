
import { memo, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { EventCard } from "./EventCard";
import { isDateInBreakPeriod } from "@/data/calendar/calendarUtils";
import { Event } from "@/types/events";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";
import { VirtualList } from "@/components/virtual/VirtualList";

interface EventsListProps {
  events: Event[];
}

interface MonthGroup {
  monthKey: string;
  monthLabel: string;
  events: Event[];
}

const log = logger.createLogger({ component: 'EventsList' });

export const EventsList = memo(({ events }: EventsListProps) => {
  const { profile } = useAuth();
  const showWhatsApp = profile?.role === 'admin' || profile?.role === 'coordinator';

  const monthGroups = useMemo((): MonthGroup[] => {
    const eventsByMonth: Record<string, Event[]> = {};

    log.info(`Grouping ${events.length} events by month`);

    events.forEach(event => {
      try {
        const date = event.main_time ? new Date(event.main_time) : new Date(event.date);
        if (isNaN(date.getTime())) {
          log.warn('Invalid date for event', { event });
          return;
        }
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!eventsByMonth[monthKey]) {
          eventsByMonth[monthKey] = [];
        }
        eventsByMonth[monthKey].push(event);
      } catch (error) {
        log.error('Error processing event for grouping', { error, event });
      }
    });

    const sortedKeys = Object.keys(eventsByMonth).sort();
    log.info(`Grouped events into ${sortedKeys.length} months`);

    return sortedKeys.map(monthKey => {
      const monthEvents = eventsByMonth[monthKey];
      let monthLabel = 'חודש לא ידוע';
      try {
        const first = monthEvents.find(e => e.main_time || e.date);
        if (first) {
          const d = first.main_time ? new Date(first.main_time) : new Date(first.date);
          monthLabel = format(d, 'MMMM yyyy', { locale: he });
        }
      } catch (error) {
        log.error('Error formatting month label', { error, monthKey });
      }
      return { monthKey, monthLabel, events: monthEvents };
    });
  }, [events]);

  const getItemKey = useCallback((group: MonthGroup) => group.monthKey, []);

  const renderMonthGroup = useCallback((group: MonthGroup) => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-900/20 p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b dark:border-gray-700">{group.monthLabel}</h2>
      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
        {group.events.map(event => {
          const inBreakPeriod = isDateInBreakPeriod(event.main_time || event.date);
          return (
            <EventCard
              key={event.id}
              event={event}
              isInBreakPeriod={inBreakPeriod}
              showWhatsApp={showWhatsApp}
            />
          );
        })}
      </div>
    </div>
  ), [showWhatsApp]);

  if (monthGroups.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-900/20 p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">לא נמצאו אירועים</p>
      </div>
    );
  }

  return (
    <VirtualList
      items={monthGroups}
      estimateSize={320}
      threshold={8}
      maxHeight={800}
      overscan={3}
      className="space-y-8"
      getItemKey={getItemKey}
      renderItem={renderMonthGroup}
    />
  );
});

EventsList.displayName = "EventsList";
