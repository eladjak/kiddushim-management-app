
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/supabase/auth';
import { toast } from '@/components/ui/use-toast';
import { AUTH_KEYS } from './constants';
import type { AuthCredentials } from '@/services/supabase/auth';

/**
 * הוק לביצוע הרשמה
 */
export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: AuthCredentials) => authService.signUp(credentials),
    onSuccess: (data) => {
      // עדכון מידע ב-query cache
      if (data.session) {
        queryClient.setQueryData(AUTH_KEYS.session(), data.session);
      }
      if (data.user) {
        queryClient.setQueryData(AUTH_KEYS.user(), data.user);
      }
      
      toast({
        title: 'נרשמת בהצלחה',
        description: data.session ? 'התחברת למערכת' : 'נשלח אימייל אימות',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error signing up:', error);
      toast({
        title: 'שגיאה בהרשמה',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};
