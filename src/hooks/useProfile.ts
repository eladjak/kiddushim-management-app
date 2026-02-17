
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
    try {
      // First try to fetch the profile
      const profileData = await fetchProfile(userId);
      
      if (!mountedRef.current) return;

      // If we have a profile, update state and check for avatar
      if (profileData) {
        // Type guard to check if profileData has necessary properties
        if (typeof profileData === 'object' && profileData !== null) {
          // Ensure all required fields have valid values
          const normalizedProfile: Profile = {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email ?? null,
            phone: profileData.phone ?? null,
            avatar_url: profileData.avatar_url ?? null,
            role: profileData.role,
            created_at: profileData.created_at,
            updated_at: profileData.updated_at,
            settings: profileData.settings ?? {},
            notification_settings: profileData.notification_settings ?? {},
            last_active: profileData.last_active ?? null,
            language: profileData.language ?? 'he',
            shabbat_mode: profileData.shabbat_mode ?? false,
            encoding_support: profileData.encoding_support ?? true
          };
          
          // Update profile with Google avatar if available and profile doesn't have one
          if (!normalizedProfile.avatar_url && user?.app_metadata?.provider === 'google') {
            const googleAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
            
            if (googleAvatarUrl) {
              await updateProfileWithGoogleAvatar(userId, googleAvatarUrl);
              normalizedProfile.avatar_url = googleAvatarUrl;
            }
          }
          
          if (mountedRef.current) {
            setProfile(normalizedProfile);
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
          // Ensure all required fields have valid values
          const normalizedProfile: Profile = {
            id: createdProfile.id,
            name: createdProfile.name,
            email: createdProfile.email ?? null,
            phone: createdProfile.phone ?? null,
            avatar_url: createdProfile.avatar_url ?? null,
            role: createdProfile.role,
            created_at: createdProfile.created_at,
            updated_at: createdProfile.updated_at,
            settings: createdProfile.settings ?? {},
            notification_settings: createdProfile.notification_settings ?? {},
            last_active: createdProfile.last_active ?? null,
            language: createdProfile.language ?? 'he',
            shabbat_mode: createdProfile.shabbat_mode ?? false,
            encoding_support: createdProfile.encoding_support ?? true
          };
          
          setProfile(normalizedProfile);
        }
        
        setIsLoading(false);
        return;
      }
      
      // If we've already tried creating a profile but still don't have one
      if (profileCreationAttemptedRef.current) {
        log.warn("Profile creation was already attempted but still no profile");
        if (mountedRef.current) setIsLoading(false);
      }
    } catch (error) {
      log.error("Error in profile handling:", error);
      if (mountedRef.current) setIsLoading(false);
    }
  };

  return { 
    profile, 
    updateAvatar 
  };
}
