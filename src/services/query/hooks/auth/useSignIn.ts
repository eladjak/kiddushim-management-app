
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/supabase/auth';
import { toast } from '@/components/ui/use-toast';
import { AUTH_KEYS } from './constants';
import { logger } from '@/utils/logger';
import type { AuthCredentials } from '@/services/supabase/auth';

/**
 * הוק לביצוע התחברות
 */
export const useSignIn = () => {
  const queryClient = useQueryClient();
  const log = logger.createLogger({ component: 'useSignIn' });

  return useMutation({
    mutationFn: (credentials: AuthCredentials) => {
      log.info('Attempting login', { email: credentials.email });
      return authService.signIn(credentials);
    },
    onSuccess: (data) => {
      // עדכון מידע ב-query cache
      queryClient.setQueryData(AUTH_KEYS.session(), data.session);
      queryClient.setQueryData(AUTH_KEYS.user(), data.user);
      
      log.info('Login successful', { userId: data.user?.id });
      
      toast({
        title: 'התחברת בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      log.error('Error signing in:', error);
      toast({
        title: 'שגיאה בהתחברות',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};
