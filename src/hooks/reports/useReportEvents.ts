
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export const useReportEvents = () => {
  const log = logger.createLogger({ component: 'useReportEvents' });
  
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        log.info("Fetching events for reports");
        
        const { data, error } = await supabase
          .from('events')
          .select('id, title, main_time, location_name, date, status, parasha')
          .order('main_time', { ascending: true });
        
        if (error) {
          log.error("Error fetching events:", { error });
          throw error;
        }
        
        log.info("Fetched events successfully", { count: data?.length || 0 });
        
        // If there are no events, return an empty array
        if (!data || data.length === 0) {
          return [];
        }
        
        // Filter out past events (events before today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Process and filter past events
        const filteredEvents = data
          .filter(event => {
            if (!event.main_time) return true; // Keep events without main_time
            const eventDate = new Date(event.main_time);
            return eventDate >= today;
          })
          .map(event => ({
            ...event,
            title: event.title,
            location_name: event.location_name,
            parasha: event.parasha
          }));
          
        if (filteredEvents.length === 0) {
          // If no events after filtering, include at least one special "no-events" option
          return [{
            id: 'no-events',
            title: 'אין אירועים זמינים',
            main_time: null,
            location_name: null,
            date: null,
            status: 'draft',
            parasha: null
          }];
        }
        
        return filteredEvents;
      } catch (error) {
        log.error("Error processing events:", { error });
        // Return a "no-events" placeholder on error
        return [{
          id: 'no-events',
          title: 'אין אירועים זמינים',
          main_time: null,
          location_name: null,
          date: null,
          status: 'draft',
          parasha: null
        }];
      }
    },
  });
};
