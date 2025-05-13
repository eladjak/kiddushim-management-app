
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import type { RoleType } from "@/types/profile";

/**
 * Hook to handle profile creation
 */
export function useProfileCreator() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'useProfileCreator' });

  /**
   * Create a new profile for a user
   */
  const createProfile = async (userId: string, user: User) => {
    try {
      setIsCreating(true);
      log.info("Creating profile for user", { userId });
      
      // First check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        log.error("Error checking existing profile:", { error: checkError });
        toast({
          variant: "destructive",
          description: "שגיאה בבדיקת פרופיל קיים. אנא נסה שוב מאוחר יותר.",
        });
        setIsCreating(false);
        return null;
      }
      
      if (existingProfile) {
        log.info("Profile already exists:", { profileId: existingProfile.id });
        return existingProfile;
      }

      // Get user metadata
      const name = user.user_metadata?.name || 
                  user.user_metadata?.full_name || 
                  user.email?.split('@')[0] || 'משתמש';
      
      const avatarUrl = user.user_metadata?.avatar_url || 
                      user.user_metadata?.picture || 
                      null;
      
      // Try to determine language based on name - if contains Hebrew chars, use he
      const hasHebrewChars = /[\u0590-\u05FF]/.test(name);
      
      // Ensure role is one of the valid enum values
      const defaultRole: RoleType = 'coordinator';

      // Create the new profile
      const profileData = {
        id: userId,
        name: name,
        email: user.email,
        language: hasHebrewChars ? 'he' : 'en',
        role: defaultRole,
        shabbat_mode: false,
        avatar_url: avatarUrl,
        encoding_support: true,
        settings: {},
        notification_settings: {}
      };

      log.info("Creating profile with data:", { profile: profileData });
      
      const { error: insertError, data } = await supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single();
      
      if (insertError) {
        // If it's not a duplicate key error
        if (insertError.code !== '23505') {
          log.error("Error creating profile:", { error: insertError });
          toast({
            variant: "destructive",
            description: "שגיאה ביצירת פרופיל. אנא נסה להתחבר מחדש.",
          });
          setIsCreating(false);
          return null;
        }
        
        // If duplicate key, profile exists, fetch it
        log.info("Profile already exists (duplicate key), fetching it");
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
          
        if (fetchError) {
          log.error("Error fetching existing profile:", { error: fetchError });
          setIsCreating(false);
          return null;
        }
        
        setIsCreating(false);
        return existingProfile;
      }
      
      log.info("Profile created successfully");
      setIsCreating(false);
      return data;
    } catch (error) {
      log.error("Error in profile creation:", { error });
      setIsCreating(false);
      return null;
    }
  };

  return {
    createProfile,
    isCreating
  };
}
