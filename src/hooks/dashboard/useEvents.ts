
import { useQuery } from "@tanstack/react-query";
import { eventsService } from "@/services/entity/events";
import { Event } from "@/types/events";
import { logger } from "@/utils/logger";
import { EVENTS_KEYS } from "@/services/query/hooks/events/eventQueryKeys";

export const useEvents = (userId?: string) => {
  const log = logger.createLogger({ component: 'dashboardUseEvents' });
  
  return useQuery({
    queryKey: ['dashboard_events', userId],
    queryFn: async () => {
      try {
        log.info("Fetching upcoming events for dashboard");
        
        // Use our updated service - make sure to sort events
        const events = await eventsService.getUpcoming();
        
        // Ensure we have valid events array with correct format
        if (!events || !Array.isArray(events)) {
          log.warn("No events returned or invalid format", { events });
          return [];
        }
        
        log.info(`Fetched ${events.length} events for dashboard`);
        
        // Filter future events and sort them by date
        const futureEvents = events
          .filter(event => {
            try {
              const eventDate = new Date(event.main_time || event.date);
              const now = new Date();
              return eventDate >= now;
            } catch (err) {
              log.error("Error filtering event date", { err, event });
              return false;
            }
          })
          .sort((a, b) => {
            try {
              const dateA = new Date(a.main_time || a.date);
              const dateB = new Date(b.main_time || b.date);
              return dateA.getTime() - dateB.getTime();
            } catch (err) {
              log.error("Error sorting event dates", { err });
              return 0;
            }
          });
        
        // Limit to 6 events for dashboard display
        return futureEvents.slice(0, 6) as Event[];
      } catch (error) {
        log.error('Error fetching events for dashboard:', error);
        return [] as Event[];
      }
    },
    enabled: true, // Always fetch events
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};
