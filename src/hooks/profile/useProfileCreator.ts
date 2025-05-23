
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { User } from "@supabase/supabase-js";

export function useProfileCreator() {
  const [isCreating, setIsCreating] = useState(false);
  const log = logger.createLogger({ component: 'useProfileCreator' });

  const createProfile = async (userId: string, user: User) => {
    setIsCreating(true);
    log.info("Creating new profile for user:", { userId });

    try {
      // Extract user data for profile creation
      const email = user.email;
      const name = user.user_metadata?.name || user.user_metadata?.full_name || email?.split('@')[0] || 'משתמש חדש';
      const avatar_url = user.user_metadata?.avatar_url || null;
      
      // Default role for new users
      const role = 'youth_volunteer';
      
      const profileData = {
        id: userId,
        email,
        name,
        avatar_url,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        settings: {},
        notification_settings: {},
        language: 'he',
        shabbat_mode: false,
        encoding_support: true
      };

      // First check if profile already exists to avoid duplicate creation attempts
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (existingProfile) {
        log.info("Profile already exists, returning existing profile", { profileId: existingProfile.id });
        setIsCreating(false);
        return existingProfile;
      }
        
      if (checkError) {
        // If we get an error checking (likely RLS related), let's try inserting with explicit authorization
        log.warn("Error checking for existing profile:", { error: checkError });
      }

      // Try inserting with the current user's authorization
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select();

      if (error) {
        log.error("Error creating profile:", { error, userId });
        
        // Common RLS errors occur when the user doesn't have permission yet
        if (error.message.includes('new row violates row-level security policy') ||
            error.code === '42501' || // permission_denied 
            error.code === '403') {  // forbidden
          
          log.info("RLS error detected. Trying alternative profile creation approach");
          
          // Workaround: Use admin functions if available or direct signup
          // For now, we'll just return null but log the issue
          setIsCreating(false);
          return null;
        }
        
        // For duplicate key errors, try to fetch the existing profile
        if (error.message.includes('duplicate key')) {
          log.info("Profile already exists, attempting to fetch it instead");
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (fetchError) {
            log.error("Error fetching existing profile:", fetchError);
            setIsCreating(false);
            return null;
          }
          
          log.info("Successfully fetched existing profile");
          setIsCreating(false);
          return existingProfile;
        }
        
        setIsCreating(false);
        return null;
      }

      log.info("Profile created successfully");
      setIsCreating(false);
      return data?.[0];
    } catch (error) {
      log.error("Unexpected error creating profile:", error);
      setIsCreating(false);
      return null;
    }
  };

  return { createProfile, isCreating };
}
