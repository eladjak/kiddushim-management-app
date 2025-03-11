
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useReportEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
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
      
      return (data || []).filter(event => {
        const eventDate = new Date(event.main_time);
        return eventDate >= today;
      });
    },
  });
};
