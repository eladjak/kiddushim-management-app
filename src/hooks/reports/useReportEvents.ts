
import { useQuery } from "@tanstack/react-query";
import { eventsService } from "@/services/entity/events";
import { logger } from "@/utils/logger";

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
            if (!event.time_start) return true; // Keep events without time_start
            const eventDate = new Date(event.time_start);
            return eventDate >= today;
          })
          .map(event => ({
            ...event,
            title: event.title,
            location_name: event.location,
            parasha: event.description
          }));
          
        if (filteredEvents.length === 0) {
          // If no events after filtering, include at least one special "no-events" option
          return [{
            id: 'no-events',
            title: 'אין אירועים זמינים',
            time_start: null,
            location_name: null,
            date: null,
            status: 'draft',
            parasha: null,
            description: '',
            location: '',
            time_end: '',
            type: 'other',
            max_participants: 0,
            created_at: '',
            updated_at: '',
            created_by: ''
          }];
        }
        
        return filteredEvents;
      } catch (error) {
        log.error("Error processing events:", { error });
        // Return a "no-events" placeholder on error
        return [{
          id: 'no-events',
          title: 'אין אירועים זמינים',
          time_start: null,
          location_name: null,
          date: null,
          status: 'draft',
          parasha: null,
          description: '',
          location: '',
          time_end: '',
          type: 'other',
          max_participants: 0,
          created_at: '',
          updated_at: '',
          created_by: ''
        }];
      }
    },
  });
};
