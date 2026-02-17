
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { RoleType } from "@/types/profile";
import type { TablesInsert } from "@/integrations/supabase/types";

/**
 * Hook for managing user profiles
 */
export function useProfileManager() {
  const [error, setError] = useState<string | null>(null);
  const log = logger.createLogger({ component: 'useProfileManager' });

  /**
   * Check if a profile exists
   */
  const checkProfile = async (userId: string) => {
    try {
      log.info("Checking profile for user:", { userId });

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        log.error("Error fetching profile:", { error });
        setError(error.message);
        return null;
      }

      log.info("Profile check result:", { hasProfile: !!data });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unexpected error checking profile";
      log.error("Unexpected error checking profile:", { error: err });
      setError(errorMessage);
      return null;
    }
  };

  /**
   * Create a new profile
   */
  const createProfile = async (userId: string, userName: string, userEmail: string | undefined, avatarUrl: string | undefined) => {
    try {
      log.info("Creating new profile for user:", { userId });

      // Check again that the profile doesn't already exist
      const existingProfile = await checkProfile(userId);
      if (existingProfile) {
        log.info("Profile already exists, no need to create a new one");
        return existingProfile;
      }

      const defaultRole: RoleType = 'coordinator';

      const profileData: TablesInsert<"profiles"> = {
        id: userId,
        name: userName,
        email: userEmail,
        role: defaultRole,
        avatar_url: avatarUrl || null,
        language: 'he',
        shabbat_mode: false,
        encoding_support: true,
        settings: {},
        notification_settings: {}
      };

      log.info("Attempting to create profile with data:", profileData);

      const { data, error } = await supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single();

      if (error) {
        // If the error is a duplicate, try to get the existing one
        if (error.code === '23505') {
          log.info("Profile was already created, trying to fetch it");
          return await checkProfile(userId);
        }

        log.error("Error creating profile:", { error });
        setError(error.message);
        return null;
      }

      log.info("Profile created successfully");
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unexpected error creating profile";
      log.error("Unexpected error creating profile:", { error: err });
      setError(errorMessage);
      return null;
    }
  };

  return {
    checkProfile,
    createProfile,
    error,
    setError
  };
}
