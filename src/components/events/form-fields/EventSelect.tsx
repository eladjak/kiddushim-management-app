
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { predefinedEvents, isDateInBreakPeriod, getHebrewMonthName } from "@/data/eventCalendar";
import type { PredefinedEvent } from "@/data/types/eventTypes";

interface EventSelectProps {
  onEventSelect: (eventId: string) => void;
}

export const EventSelect = ({ onEventSelect }: EventSelectProps) => {
  // Group events by month
  const eventsByMonth: Record<string, PredefinedEvent[]> = {};
  predefinedEvents.forEach(event => {
    const date = new Date(event.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!eventsByMonth[monthKey]) {
      eventsByMonth[monthKey] = [];
    }
    eventsByMonth[monthKey].push(event);
  });

  return (
    <Select onValueChange={onEventSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="בחר מועד קידושישי מתוכנן" />
      </SelectTrigger>
      <SelectContent className="max-h-[350px]">
        {Object.entries(eventsByMonth).map(([monthKey, monthEvents]) => {
          const firstEvent = monthEvents[0];
          const hebrewMonth = getHebrewMonthName(firstEvent.date);
          
          return (
            <div key={monthKey} className="mb-2">
              <div className="px-2 py-1 font-semibold bg-secondary/20 rounded-sm text-right">
                {hebrewMonth} (חודש {new Date(firstEvent.date).getMonth() + 1})
              </div>
              {monthEvents.map(event => {
                const isBreakPeriod = isDateInBreakPeriod(event.date);
                return (
                  <SelectItem 
                    key={event.id} 
                    value={event.id}
                    disabled={isBreakPeriod}
                    className={isBreakPeriod ? "opacity-50 line-through" : ""}
                  >
                    {event.dayOfWeek}, {event.hebrewDate} - {event.parasha}
                    {event.serviceLadiesAvailable && " 👧"}
                    {isBreakPeriod && " (בתוך תקופת הפסקה)"}
                  </SelectItem>
                );
              })}
            </div>
          );
        })}
      </SelectContent>
    </Select>
  );
};
