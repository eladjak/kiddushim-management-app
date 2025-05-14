
import { useQuery } from "@tanstack/react-query";
import { eventsService } from "@/services/entity/events";
import { Event } from "@/types/events";
import { logger } from "@/utils/logger";

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
            const eventDate = new Date(event.main_time || event.date);
            const now = new Date();
            return eventDate >= now;
          })
          .sort((a, b) => {
            const dateA = new Date(a.main_time || a.date);
            const dateB = new Date(b.main_time || b.date);
            return dateA.getTime() - dateB.getTime();
          });
        
        // Limit to 6 events for dashboard display
        return futureEvents.slice(0, 6) as Event[];
      } catch (error) {
        log.error('Error fetching events for dashboard:', error);
        return [] as Event[];
      }
    },
    enabled: true, // Always fetch events
  });
};
