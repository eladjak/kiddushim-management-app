
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { predefinedEvents } from "@/data/calendar/predefinedEvents";
import { isDateInBreakPeriod, getHebrewMonthName } from "@/data/calendar/calendarUtils";
import { PredefinedEvent } from "@/data/types/eventTypes";
import { logger } from "@/utils/logger";

interface EventSelectProps {
  onEventSelect: (eventId: string) => void;
}

export const EventSelect = ({ onEventSelect }: EventSelectProps) => {
  const log = logger.createLogger({ component: 'EventSelect' });
  
  // Group events by month
  const eventsByMonth: Record<string, PredefinedEvent[]> = {};
  
  // Filter out past events
  const today = new Date();
  const upcomingEvents = predefinedEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today;
  });
  
  // Log for debugging
  log.info(`Found ${upcomingEvents.length} upcoming events`);
  
  upcomingEvents.forEach(event => {
    try {
      // Make sure we have a valid date
      const date = new Date(event.date);
      
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

  // Find the next upcoming event (nearest in the future)
  const getNextEventId = () => {
    const today = new Date();
    const nextEvent = upcomingEvents.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    })[0];
    
    return nextEvent?.id || '';
  };

  return (
    <Select onValueChange={onEventSelect} defaultValue={getNextEventId()}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="בחר מועד קידושישי מתוכנן" />
      </SelectTrigger>
      <SelectContent className="max-h-[350px]">
        {sortedMonthKeys.length > 0 ? (
          sortedMonthKeys.map(monthKey => {
            const monthEvents = eventsByMonth[monthKey];
            const firstEvent = monthEvents[0];
            const hebrewMonth = getHebrewMonthName(firstEvent.date);
            
            return (
              <div key={monthKey} className="mb-2">
                <div className="px-2 py-1 font-semibold bg-secondary/20 rounded-sm text-right">
                  {hebrewMonth} (חודש {new Date(firstEvent.date).getMonth() + 1})
                </div>
                {monthEvents.map(event => {
                  const isBreakPeriod = isDateInBreakPeriod(event.date);
                  const eventDate = new Date(event.date);
                  const today = new Date();
                  const isPast = eventDate < today;
                  
                  return (
                    <SelectItem 
                      key={event.id} 
                      value={event.id}
                      disabled={isBreakPeriod || isPast}
                      className={`${isBreakPeriod ? "opacity-50 line-through" : ""} ${isPast ? "text-gray-400" : ""}`}
                    >
                      {event.dayOfWeek}, {event.hebrewDate} - {event.parasha}
                      {event.serviceLadiesAvailable && " 👧"}
                      {isBreakPeriod && " (בתוך תקופת הפסקה)"}
                      {isPast && " (עבר)"}
                    </SelectItem>
                  );
                })}
              </div>
            );
          })
        ) : (
          <SelectItem value="no-events" disabled>אין אירועים עתידיים זמינים</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};
