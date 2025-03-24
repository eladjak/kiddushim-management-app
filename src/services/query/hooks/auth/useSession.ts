
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/supabase/auth';
import { AUTH_KEYS } from './constants';
import type { Session } from '@supabase/supabase-js';

/**
 * הוק לקבלת נתוני סשן נוכחי
 */
export const useSession = () => {
  return useQuery<Session | null, Error>({
    queryKey: AUTH_KEYS.session(),
    queryFn: () => authService.getCurrentSession(),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
};
