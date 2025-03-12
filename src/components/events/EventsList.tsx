
import { useState } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { EventCard } from "./EventCard";
import { isDateInBreakPeriod } from "@/data/eventCalendar";

interface Event {
  id: string;
  title: string;
  main_time: string;
  location_name: string;
  parasha?: string;
  status?: string;
}

interface EventsListProps {
  events: Event[];
}

export const EventsList = ({ events }: EventsListProps) => {
  // Group events by month
  const eventsByMonth: Record<string, Event[]> = {};
  events.forEach(event => {
    const date = new Date(event.main_time);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!eventsByMonth[monthKey]) {
      eventsByMonth[monthKey] = [];
    }
    eventsByMonth[monthKey].push(event);
  });
  
  // Sort months chronologically
  const sortedMonthKeys = Object.keys(eventsByMonth).sort();

  return (
    <div className="space-y-8">
      {sortedMonthKeys.map(monthKey => {
        const monthEvents = eventsByMonth[monthKey];
        const firstEventDate = new Date(monthEvents[0].main_time);
        const monthLabel = format(firstEventDate, 'MMMM yyyy', { locale: he });
        
        return (
          <div key={monthKey} className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">{monthLabel}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {monthEvents.map(event => (
                <EventCard 
                  key={event.id}
                  event={event}
                  isInBreakPeriod={isDateInBreakPeriod(event.main_time)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
