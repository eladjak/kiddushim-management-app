
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { RoleType } from "@/types/profile";

/**
 * Hook to manage profile checking and creation
 */
export function useProfileManager() {
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'useProfileManager' });

  /**
   * Check if profile exists for a user
   */
  const checkProfile = async (userId: string) => {
    try {
      log.info("Checking if profile exists for user:", { userId });
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        log.error("Error checking profile:", { error });
        return null;
      }
      
      return data;
    } catch (error) {
      log.error("Unexpected error checking profile:", { error });
      return null;
    }
  };

  /**
   * Create a new user profile
   */
  const createProfile = async (
    userId: string, 
    userName: string, 
    userEmail: string | undefined, 
    avatarUrl: string | null
  ) => {
    try {
      log.info("Creating profile for user:", { userId });
      setIsCreatingProfile(true);
      
      // Force wait to ensure no race conditions with trigger
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if profile already exists (one more time)
      const existingProfile = await checkProfile(userId);
      if (existingProfile) {
        log.info("Profile already exists, no need to create");
        setIsCreatingProfile(false);
        return existingProfile;
      }
      
      const defaultRole: RoleType = 'coordinator';
      
      const { error, data } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          name: userName,
          email: userEmail,
          language: 'he', // Default to Hebrew
          role: defaultRole,
          avatar_url: avatarUrl,
          shabbat_mode: false
        })
        .select()
        .single();
      
      if (error) {
        // If not a duplicate key error
        if (error.code !== '23505') {
          log.error("Error creating profile:", { error });
          toast({
            variant: "destructive",
            description: "שגיאה ביצירת פרופיל. מנסה שוב...",
          });
          setIsCreatingProfile(false);
          return null;
        } else {
          log.info("Profile already exists (duplicate key)");
          const existingProfile = await checkProfile(userId);
          setIsCreatingProfile(false);
          return existingProfile;
        }
      }
      
      log.info("Profile created successfully");
      setIsCreatingProfile(false);
      return data;
    } catch (error) {
      log.error("Unexpected error creating profile:", { error });
      setIsCreatingProfile(false);
      return null;
    }
  };

  return {
    checkProfile,
    createProfile,
    isCreatingProfile
  };
}
