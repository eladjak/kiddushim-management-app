
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

      // Use type assertion to fix type issues with Supabase
      const newProfile = {
        id: userId as any,
        name: name,
        email: user.email,
        language: hasHebrewChars ? 'he' : 'en',
        role: defaultRole as any,
        shabbat_mode: false,
        avatar_url: avatarUrl,
        encoding_support: true
      } as any;

      log.info("Creating profile with data:", { profile: newProfile });
      
      const { error: insertError, data } = await supabase
        .from("profiles")
        .insert(newProfile)
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
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId as any)
          .single();
          
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
