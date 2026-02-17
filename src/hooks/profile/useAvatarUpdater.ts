
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { User } from "@supabase/supabase-js";
import type { TablesUpdate } from "@/integrations/supabase/types";

export function useAvatarUpdater(user: User | null) {
  const [isUpdating, setIsUpdating] = useState(false);
  const log = logger.createLogger({ component: 'useAvatarUpdater' });

  /**
   * Update profile with Google avatar URL
   */
  const updateProfileWithGoogleAvatar = async (userId: string, avatarUrl: string) => {
    try {
      log.info("Updating profile with Google avatar:", { userId, avatarUrl });
      
      const updateData: TablesUpdate<"profiles"> = {
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        };
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);
      
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
      
      const updateData: TablesUpdate<"profiles"> = {
          avatar_url: url,
          updated_at: new Date().toISOString()
        };
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);
      
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
