
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/auth";
import { logger } from "@/utils/logger";
import { useProfileFetcher } from "@/hooks/profile/useProfileFetcher";
import { useProfileCreator } from "@/hooks/profile/useProfileCreator";
import { useAvatarUpdater } from "@/hooks/profile/useAvatarUpdater";

export function useProfile(user: User | null, setIsLoading: (value: boolean) => void) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const log = logger.createLogger({ component: 'useProfile' });
  
  // Use our new modular hooks
  const { 
    fetchProfile, 
    retryCount, 
    profileCreationAttemptedRef,
    mountedRef,
    cleanup
  } = useProfileFetcher(user, setIsLoading);
  
  const { createProfile } = useProfileCreator();
  const { updateProfileWithGoogleAvatar, updateAvatar } = useAvatarUpdater(user);

  // Fetch profile when user changes
  useEffect(() => {
    if (user) {
      handleProfileFetch(user.id);
    } else {
      setProfile(null);
      if (mountedRef.current) setIsLoading(false);
      profileCreationAttemptedRef.current = false;
    }

    return cleanup;
  }, [user]);

  // Main function to handle profile fetching and creation
  const handleProfileFetch = async (userId: string) => {
    // First try to fetch the profile
    const profileData = await fetchProfile(userId);
    
    if (!mountedRef.current) return;

    // If we have a profile, update state and check for avatar
    if (profileData) {
      // Type guard to check if profileData has necessary properties
      if (typeof profileData === 'object' && profileData !== null) {
        const typedProfile = profileData as Profile;
        
        // Ensure avatar_url is always set to at least null (not undefined)
        if (typedProfile.avatar_url === undefined) {
          typedProfile.avatar_url = null;
        }
        
        // Update profile with Google avatar if available and profile doesn't have one
        if (!typedProfile.avatar_url && user?.app_metadata?.provider === 'google') {
          const googleAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
          
          if (googleAvatarUrl) {
            await updateProfileWithGoogleAvatar(userId, googleAvatarUrl);
            typedProfile.avatar_url = googleAvatarUrl;
          }
        }
        
        if (mountedRef.current) {
          setProfile(typedProfile);
          setIsLoading(false);
        }
      } else {
        log.error("Profile data is not in expected format:", { profileData });
        if (mountedRef.current) setIsLoading(false);
      }
      return;
    }
    
    // If we don't have a profile after retries, try to create one
    if (retryCount >= 5 && !profileCreationAttemptedRef.current && user) {
      log.info("Max retries reached, attempting to create profile");
      profileCreationAttemptedRef.current = true;
      
      const createdProfile = await createProfile(userId, user);
      
      if (!mountedRef.current) return;
      
      if (createdProfile) {
        // Ensure avatar_url is always set to at least null (not undefined)
        if (createdProfile.avatar_url === undefined) {
          createdProfile.avatar_url = null;
        }
        
        setProfile(createdProfile as Profile);
      }
      
      setIsLoading(false);
      return;
    }
    
    // If we've already tried creating a profile but still don't have one
    if (profileCreationAttemptedRef.current) {
      log.warn("Profile creation was already attempted but still no profile");
      if (mountedRef.current) setIsLoading(false);
    }
  };

  return { 
    profile, 
    updateAvatar 
  };
}
