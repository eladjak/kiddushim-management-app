
import { useEffect, useState } from 'react';
import { useSession } from './useSession';
import { useCurrentUser } from './useCurrentUser';
import { useUserProfile } from './useUserProfile';
import { useSignOut } from './useSignOut';
import { useUpdateAvatar } from './useUpdateAvatar';
import { useAuthStateChange } from './useAuthStateChange';
import { logger } from '@/utils/logger';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/types/auth';

/**
 * הוק מאוחד לניהול אימות
 */
export const useAuthentication = () => {
  const log = logger.createLogger({ component: 'useAuthentication' });
  const { data: session, isLoading: isSessionLoading } = useSession();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  
  // Add state for user, session, and profile with setters
  const [userState, setUserState] = useState<User | null>(null);
  const [sessionState, setSessionState] = useState<Session | null>(null);
  const [profileState, setProfileState] = useState<Profile | null>(null);
  const [isLoadingState, setIsLoadingState] = useState(true);
  
  // Update local state when query data changes
  useEffect(() => {
    if (user !== undefined) setUserState(user);
  }, [user]);
  
  useEffect(() => {
    if (session !== undefined) setSessionState(session);
  }, [session]);
  
  const { 
    data: profile, 
    isLoading: isProfileLoading,
    error: profileError
  } = useUserProfile(user?.id);
  
  useEffect(() => {
    if (profile) setProfileState(profile);
  }, [profile]);
  
  useEffect(() => {
    if (profileError) {
      log.error('Error loading user profile:', profileError);
    }
  }, [profileError]);
  
  useAuthStateChange();
  
  const signOut = useSignOut();
  const updateAvatar = useUpdateAvatar(user?.id);
  
  const isLoading = isSessionLoading || isUserLoading || 
                   (!!user && isProfileLoading && !profileError);
  
  useEffect(() => {
    setIsLoadingState(isLoading);
  }, [isLoading]);
  
  useEffect(() => {
    log.info('Auth state:', { 
      isLoading, 
      sessionExists: !!session, 
      userExists: !!user, 
      profileExists: !!profile,
      hasProfileError: !!profileError,
      userId: user?.id
    });
  }, [isLoading, user, profile, profileError, session]);
  
  return {
    session: sessionState,
    user: userState,
    profile: profileState || null,
    isLoading: isLoadingState,
    isAuthenticated: !!session && !!user,
    signOut: signOut.mutate,
    updateAvatar: (url: string) => updateAvatar.mutate(url),
    // Expose setters
    setUser: setUserState,
    setSession: setSessionState,
    setProfile: setProfileState,
    setIsLoading: setIsLoadingState
  };
};
