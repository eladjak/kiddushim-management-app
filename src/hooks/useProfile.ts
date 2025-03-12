
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/auth";

export function useProfile(user: User | null, setIsLoading: (value: boolean) => void) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'useProfile' });

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [user]);

  const fetchProfile = async (userId: string) => {
    try {
      log.info("Fetching profile for user:", { userId });
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          log.info("Profile not found, it may be created by the trigger soon");
          // Wait a moment and try again
          setTimeout(async () => {
            const { data: retryData, error: retryError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .single();
              
            if (!retryError) {
              log.info("Profile fetched on retry:", { profileFound: !!retryData });
              setProfile(retryData);
            } else {
              log.error("Error fetching profile on retry:", { error: retryError });
            }
            setIsLoading(false);
          }, 2000);
          return;
        }
        
        log.error("Error fetching profile:", { error });
        setIsLoading(false);
        return;
      }

      log.info("Profile fetched:", { profileFound: !!data });
      
      // Update profile with Google avatar if available and profile doesn't have one
      if (data && !data.avatar_url && user?.app_metadata?.provider === 'google') {
        const googleAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        
        if (googleAvatarUrl) {
          await updateProfileWithGoogleAvatar(userId, googleAvatarUrl);
          data.avatar_url = googleAvatarUrl;
        }
      }
      
      setProfile(data);
      setIsLoading(false);
    } catch (error) {
      log.error("Error fetching profile:", { error });
      setIsLoading(false);
    }
  };

  const updateProfileWithGoogleAvatar = async (userId: string, avatarUrl: string) => {
    try {
      log.info("Updating profile with Google avatar");
      
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;
      
      log.info("Profile updated with Google avatar");
    } catch (error) {
      log.error("Error updating profile with Google avatar:", { error });
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString() 
        })
        .eq("id", user.id);

      if (error) throw error;
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      
      toast({
        description: "תמונת הפרופיל עודכנה בהצלחה",
      });
    } catch (error: any) {
      console.error("Error updating avatar:", error);
      toast({
        variant: "destructive",
        description: `שגיאה בעדכון תמונת הפרופיל: ${error.message}`,
      });
    }
  };

  return { profile, updateAvatar };
}
