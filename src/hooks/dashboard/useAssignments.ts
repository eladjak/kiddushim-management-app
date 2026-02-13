
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

const log = logger.createLogger({ component: 'useAssignments' });

export const useAssignments = (userId?: string) => {
  return useQuery({
    queryKey: ['assignments', userId],
    queryFn: async () => {
      // Skip if there's no user ID
      if (!userId) return [];

      try {
        const { data, error } = await supabase
          .from('event_assignments')
          .select('*')
          .eq('user_id', userId as any)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return data || [];
      } catch (error) {
        log.error('Error fetching assignments:', { error });
        return [];
      }
    },
    // Only run if we have a user ID
    enabled: !!userId,
  });
};
