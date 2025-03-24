
import { useEffect } from 'react';
import { useSession } from './useSession';
import { useCurrentUser } from './useCurrentUser';
import { useUserProfile } from './useUserProfile';
import { useSignOut } from './useSignOut';
import { useUpdateAvatar } from './useUpdateAvatar';
import { useAuthStateChange } from './useAuthStateChange';

/**
 * הוק מאוחד לניהול אימות
 */
export const useAuthentication = () => {
  const { data: session, isLoading: isSessionLoading } = useSession();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  
  const { 
    data: profile, 
    isLoading: isProfileLoading,
    error: profileError
  } = useUserProfile(user?.id);
  
  useEffect(() => {
    if (profileError) {
      console.error('Error loading user profile:', profileError);
    }
  }, [profileError]);
  
  useAuthStateChange();
  
  const signOut = useSignOut();
  const updateAvatar = useUpdateAvatar(user?.id);
  
  const isLoading = isSessionLoading || isUserLoading || 
                   (!!user && isProfileLoading && !profileError);
  
  useEffect(() => {
    console.log('Auth state:', { 
      isLoading, 
      user: !!user, 
      profile: !!profile,
      hasProfileError: !!profileError 
    });
  }, [isLoading, user, profile, profileError]);
  
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
