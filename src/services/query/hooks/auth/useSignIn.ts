
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/supabase/auth';
import { toast } from '@/components/ui/use-toast';
import { AUTH_KEYS } from './constants';
import type { AuthCredentials } from '@/services/supabase/auth';

/**
 * הוק לביצוע התחברות
 */
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: AuthCredentials) => authService.signIn(credentials),
    onSuccess: (data) => {
      // עדכון מידע ב-query cache
      queryClient.setQueryData(AUTH_KEYS.session(), data.session);
      queryClient.setQueryData(AUTH_KEYS.user(), data.user);
      
      toast({
        title: 'התחברת בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error signing in:', error);
      toast({
        title: 'שגיאה בהתחברות',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};
