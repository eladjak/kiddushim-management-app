
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import type { User } from "@supabase/supabase-js";

/**
 * Hook to handle avatar updates
 */
export function useAvatarUpdater(user: User | null) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'useAvatarUpdater' });

  /**
   * Update Google avatar for a profile
   */
  const updateProfileWithGoogleAvatar = async (userId: string, avatarUrl: string) => {
    try {
      log.info("Updating profile with Google avatar");
      
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;
      
      log.info("Profile updated with Google avatar");
      return true;
    } catch (error) {
      log.error("Error updating profile with Google avatar:", { error });
      return false;
    }
  };

  /**
   * Update user's avatar
   */
  const updateAvatar = async (avatarUrl: string) => {
    if (!user?.id) return false;
    
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from("profiles")
        .update({ 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString() 
        })
        .eq("id", user.id);

      if (error) throw error;
      
      setIsUpdating(false);
      
      toast({
        description: "תמונת הפרופיל עודכנה בהצלחה",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error updating avatar:", error);
      setIsUpdating(false);
      
      toast({
        variant: "destructive",
        description: `שגיאה בעדכון תמונת הפרופיל: ${error.message}`,
      });
      
      return false;
    }
  };

  return {
    updateProfileWithGoogleAvatar,
    updateAvatar,
    isUpdating
  };
}
