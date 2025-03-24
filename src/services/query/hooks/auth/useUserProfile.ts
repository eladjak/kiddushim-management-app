
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/entity/users';
import { AUTH_KEYS } from './constants';
import type { UserProfile } from '@/types/profile';

/**
 * הוק לקבלת פרופיל משתמש
 */
export const useUserProfile = (userId?: string) => {
  return useQuery<UserProfile, Error>({
    queryKey: AUTH_KEYS.profile(userId || ''),
    queryFn: async () => {
      if (!userId) {
        throw new Error('Missing user ID');
      }
      return usersService.getProfile(userId);
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    retry: 3,
  });
};
