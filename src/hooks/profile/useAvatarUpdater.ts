
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export function useAvatarUpdater(user: any) {
  const [isUpdating, setIsUpdating] = useState(false);
  const log = logger.createLogger({ component: 'useAvatarUpdater' });

  /**
   * Update profile with Google avatar URL
   */
  const updateProfileWithGoogleAvatar = async (userId: string, avatarUrl: string) => {
    try {
      log.info("Updating profile with Google avatar:", { userId, avatarUrl });
      
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        } as any)
        .eq("id", userId as any);
      
      if (error) {
        log.error("Error updating avatar from Google:", { error });
        return false;
      }
      
      log.info("Profile avatar updated from Google successfully");
      return true;
    } catch (error) {
      log.error("Unexpected error updating avatar from Google:", { error });
      return false;
    }
  };

  /**
   * Update avatar URL in profile
   */
  const updateAvatar = async (url: string) => {
    if (!user?.id) {
      log.error("Cannot update avatar: No user ID");
      return false;
    }
    
    setIsUpdating(true);
    
    try {
      log.info("Updating avatar:", { userId: user.id, url });
      
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: url,
          updated_at: new Date().toISOString()
        } as any)
        .eq("id", user.id as any);
      
      if (error) {
        log.error("Error updating avatar:", { error });
        return false;
      }
      
      log.info("Avatar updated successfully");
      return true;
    } catch (error) {
      log.error("Unexpected error updating avatar:", { error });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateProfileWithGoogleAvatar,
    updateAvatar,
    isUpdating
  };
}
