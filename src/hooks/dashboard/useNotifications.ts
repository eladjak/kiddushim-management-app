
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useNotifications = (userId?: string) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      // Skip if there's no user ID
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .eq('read', false)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    },
    // Only run if we have a user ID
    enabled: !!userId,
  });
};
