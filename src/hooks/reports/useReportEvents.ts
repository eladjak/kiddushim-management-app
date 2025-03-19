import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export const useReportEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, title, main_time, location_name, date, status, parasha')
          .order('main_time', { ascending: true });
        
        if (error) {
          throw error;
        }
        
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
        logger.error("Error fetching events:", { error });
        return [];
      }
    },
  });
};
