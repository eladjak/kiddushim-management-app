
import { useQuery } from "@tanstack/react-query";
import { eventsService } from "@/services/entity/events";
import { logger } from "@/utils/logger";
import { Event } from "@/types/events";

export const useReportEvents = () => {
  const log = logger.createLogger({ component: 'useReportEvents' });
  
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        log.info("Fetching events for reports");
        
        // Use our updated event service
        const events = await eventsService.getUpcoming();
        
        log.info("Fetched events successfully", { count: events?.length || 0 });
        
        // If there are no events, return an empty array
        if (!events || events.length === 0) {
          return [];
        }
        
        // Filter out past events (events before today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Process and filter past events
        const filteredEvents = events
          .filter(event => {
            const eventDate = new Date(event.main_time);
            return eventDate >= today;
          })
          .map(event => ({
            ...event,
            title: event.title,
            location_name: event.location_name || event.location,
            parasha: event.parasha || event.description
          }));
          
        if (filteredEvents.length === 0) {
          // If no events after filtering, include at least one special "no-events" option
          return [{
            id: 'no-events',
            title: 'אין אירועים זמינים',
            main_time: '',
            location_name: '',
            date: '',
            status: 'draft',
            parasha: '',
            description: '',
            location: '',
            created_at: '',
            updated_at: '',
            created_by: '',
          } as unknown as Event];
        }
        
        return filteredEvents;
      } catch (error) {
        log.error("Error processing events:", { error });
        // Return a "no-events" placeholder on error
        return [{
          id: 'no-events',
          title: 'אין אירועים זמינים',
          main_time: '',
          location_name: '',
          date: '',
          status: 'draft',
          parasha: '',
          description: '',
          location: '',
          created_at: '',
          updated_at: '',
          created_by: '',
        } as unknown as Event];
      }
    },
  });
};
