/**
 * שליפת השיבוצים של מתנדב/ת מסוים, מצורף לפרטי האירוע (כותרת, תאריך, שעה).
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

const log = logger.createLogger({ component: 'useVolunteerAssignments' });

export interface VolunteerAssignment {
  id: string;
  role: string;
  status: string | null;
  created_at: string;
  event: {
    id: string;
    title: string;
    date: string;
    main_time: string | null;
    location_name: string | null;
  } | null;
}

/**
 * @param userId מזהה המתנדב/ת
 * @param enabled האם להריץ את השאילתה (בד"כ כשהדיאלוג פתוח)
 */
export function useVolunteerAssignments(userId: string | undefined, enabled = true) {
  return useQuery<VolunteerAssignment[]>({
    queryKey: ['volunteer-assignments', userId],
    enabled: enabled && !!userId,
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('event_assignments')
        .select(
          'id, role, status, created_at, events ( id, title, date, main_time, location_name )',
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        log.error('שגיאה בשליפת שיבוצי מתנדב/ת', { error, userId });
        throw error;
      }

      type Row = {
        id: string;
        role: string;
        status: string | null;
        created_at: string;
        events:
          | {
              id: string;
              title: string;
              date: string;
              main_time: string | null;
              location_name: string | null;
            }
          | null;
      };

      return ((data ?? []) as Row[]).map((row) => ({
        id: row.id,
        role: row.role,
        status: row.status,
        created_at: row.created_at,
        event: row.events,
      }));
    },
  });
}

export default useVolunteerAssignments;
