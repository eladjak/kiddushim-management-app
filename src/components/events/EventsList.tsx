
import { useState } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { EventCard } from "./EventCard";
import { isDateInBreakPeriod } from "@/data/calendar/calendarUtils";
import { Event } from "@/types/events";
import { logger } from "@/utils/logger";

interface EventsListProps {
  events: Event[];
}

export const EventsList = ({ events }: EventsListProps) => {
  const log = logger.createLogger({ component: 'EventsList' });
  
  // Group events by month
  const eventsByMonth: Record<string, Event[]> = {};
  
  // Log for debugging
  log.info(`Grouping ${events.length} events by month`);
  
  events.forEach(event => {
    try {
      // Make sure we have a valid date
      const date = event.main_time ? new Date(event.main_time) : new Date(event.date);
      
      if (isNaN(date.getTime())) {
        log.warn('Invalid date for event', { event });
        return;
      }
      
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!eventsByMonth[monthKey]) {
        eventsByMonth[monthKey] = [];
      }
      
      eventsByMonth[monthKey].push(event);
    } catch (error) {
      log.error('Error processing event for grouping', { error, event });
    }
  });
  
  // Sort months chronologically
  const sortedMonthKeys = Object.keys(eventsByMonth).sort();
  
  log.info(`Grouped events into ${sortedMonthKeys.length} months`);

  return (
    <div className="space-y-8">
      {sortedMonthKeys.length > 0 ? (
        sortedMonthKeys.map(monthKey => {
          const monthEvents = eventsByMonth[monthKey];
          
          // Get the first valid date for the month label
          let monthLabel = 'חודש לא ידוע';
          
          try {
            if (monthEvents.length > 0) {
              const firstEventWithDate = monthEvents.find(e => e.main_time || e.date);
              if (firstEventWithDate) {
                const date = firstEventWithDate.main_time 
                  ? new Date(firstEventWithDate.main_time)
                  : new Date(firstEventWithDate.date);
                  
                monthLabel = format(date, 'MMMM yyyy', { locale: he });
              }
            }
          } catch (error) {
            log.error('Error formatting month label', { error, monthKey });
          }
          
          return (
            <div key={monthKey} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">{monthLabel}</h2>
              {/* רשת פשוטה ללא RovingFocusGroup כדי למנוע שגיאות */}
              <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
                {monthEvents.map(event => {
                  const inBreakPeriod = isDateInBreakPeriod(event.main_time || event.date);
                  return (
                    <EventCard 
                      key={event.id}
                      event={event}
                      isInBreakPeriod={inBreakPeriod}
                    />
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">לא נמצאו אירועים</p>
        </div>
      )}
    </div>
  );
};
