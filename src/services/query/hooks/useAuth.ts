import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { authService } from '@/services/supabase/auth';
import { usersService } from '@/services/entity/users';
import { toast } from '@/components/ui/use-toast';
import { useEffect } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/profile';
import type { AuthCredentials } from '@/services/supabase/auth';

// קבועים לשימוש כמפתחות query
export const AUTH_KEYS = {
  session: () => ['auth', 'session'] as const,
  user: () => ['auth', 'user'] as const,
  profile: (id: string) => ['auth', 'profile', id] as const,
};

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

/**
 * הוק לקבלת נתוני משתמש מחובר
 */
export const useCurrentUser = () => {
  return useQuery<SupabaseUser | null, Error>({
    queryKey: AUTH_KEYS.user(),
    queryFn: () => authService.getCurrentUser(),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

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
      const user = queryClient.getQueryData<SupabaseUser>(AUTH_KEYS.user());
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

/**
 * הוק מאוחד לניהול אימות
 */
export const useAuthentication = () => {
  const { data: session, isLoading: isSessionLoading } = useSession();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { data: profile, isLoading: isProfileLoading } = useUserProfile(user?.id);
  
  useAuthStateChange();
  
  const signOut = useSignOut();
  const updateAvatar = useUpdateAvatar(user?.id);
  
  const isLoading = isSessionLoading || isUserLoading || (!!user && isProfileLoading);
  
  return {
    session,
    user,
    profile: profile || null,
    isLoading,
    isAuthenticated: !!session && !!user,
    signOut: signOut.mutate,
    updateAvatar: (url: string) => updateAvatar.mutate(url),
  };
}; 