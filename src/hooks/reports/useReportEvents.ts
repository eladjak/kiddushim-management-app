
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
        
        // Filter out past events (events before today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Process and filter past events
        return (data || [])
          .filter(event => {
            const eventDate = new Date(event.main_time);
            return eventDate >= today;
          })
          .map(event => ({
            ...event,
            // No need to encode/decode here, keeping data as is
            title: event.title,
            location_name: event.location_name,
            parasha: event.parasha
          }));
      } catch (error) {
        log.error("Error processing events:", { error });
        return [];
      }
    },
  });
};
