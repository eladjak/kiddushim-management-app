
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/entity/users';
import { toast } from '@/components/ui/use-toast';
import { AUTH_KEYS } from './constants';
import type { UserProfile } from '@/types/profile';

/**
 * הוק לעדכון אווטאר
 */
export const useUpdateAvatar = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avatarUrl: string) => {
      if (!userId) {
        throw new Error('Missing user ID');
      }
      return usersService.updateProfile(userId, { avatar_url: avatarUrl });
    },
    onSuccess: (data) => {
      // עדכון מטמון פרופיל
      if (userId) {
        queryClient.setQueryData<UserProfile>(AUTH_KEYS.profile(userId), data);
      }
      
      toast({
        title: 'התמונה עודכנה בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating avatar:', error);
      toast({
        title: 'שגיאה בעדכון תמונה',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

