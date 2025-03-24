
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/supabase/auth';
import { AUTH_KEYS } from './constants';

/**
 * הוק מאזין לשינויים במצב האימות
 */
export const useAuthStateChange = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // הגדרת מאזין לשינויים באימות
    const unsubscribe = authService.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // עדכון מידע בקאש
        queryClient.setQueryData(AUTH_KEYS.session(), session);
        queryClient.setQueryData(AUTH_KEYS.user(), session?.user || null);
        
        // אילוץ טעינה מחדש של פרופיל
        if (session?.user?.id) {
          queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile(session.user.id) });
        }
      } else if (event === 'SIGNED_OUT') {
        // ניקוי מידע מהקאש
        queryClient.setQueryData(AUTH_KEYS.session(), null);
        queryClient.setQueryData(AUTH_KEYS.user(), null);
      }
    });

    return () => {
      // ניקוי המאזין בעת יציאה מהקומפוננטה
      unsubscribe();
    };
  }, [queryClient]);
};
