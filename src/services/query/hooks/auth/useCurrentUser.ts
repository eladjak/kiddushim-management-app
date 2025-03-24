
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/supabase/auth';
import { AUTH_KEYS } from './constants';
import type { User } from '@supabase/supabase-js';

/**
 * הוק לקבלת נתוני משתמש מחובר
 */
export const useCurrentUser = () => {
  return useQuery<User | null, Error>({
    queryKey: AUTH_KEYS.user(),
    queryFn: () => authService.getCurrentUser(),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
};
