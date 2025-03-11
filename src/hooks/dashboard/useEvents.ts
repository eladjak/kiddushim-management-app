
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useEvents = (userId?: string) => {
  return useQuery({
    queryKey: ['events', userId],
    queryFn: async () => {
      // Skip if there's no user ID
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, title, main_time, location_name, date, status, parasha')
          .order('main_time', { ascending: true })
          .limit(6);
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('Error fetching events:', error);
        return [];
      }
    },
    // Only run if we have a user ID
    enabled: !!userId,
  });
};
