
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/supabase/auth';
import { toast } from '@/components/ui/use-toast';
import { AUTH_KEYS } from './constants';
import type { User } from '@supabase/supabase-js';

/**
 * הוק לביצוע התנתקות
 */
export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      // ניקוי מטמון
      queryClient.setQueryData(AUTH_KEYS.session(), null);
      queryClient.setQueryData(AUTH_KEYS.user(), null);
      
      // מחיקת פרופיל המשתמש מהמטמון - נשיג את מזהה המשתמש קודם
      const user = queryClient.getQueryData<User>(AUTH_KEYS.user());
      if (user?.id) {
        queryClient.removeQueries({ queryKey: AUTH_KEYS.profile(user.id) });
      }
      
      toast({
        title: 'התנתקת בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error signing out:', error);
      toast({
        title: 'שגיאה בהתנתקות',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};
