
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

      // Insert profile with explicit API key in headers to ensure authorization
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select();

      if (error) {
        log.error("Error creating profile:", { error, userId });
        
        // Try to identify specific issues
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
