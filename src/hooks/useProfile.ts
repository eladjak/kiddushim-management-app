
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/auth";
import type { RoleType } from "@/types/profile";

export function useProfile(user: User | null, setIsLoading: (value: boolean) => void) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'useProfile' });
  const mountedRef = useRef(true);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileCreationAttemptedRef = useRef(false);

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
      if (mountedRef.current) setIsLoading(false);
      profileCreationAttemptedRef.current = false;
      setRetryCount(0);
    }

    return () => {
      mountedRef.current = false;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [user]);

  const fetchProfile = async (userId: string) => {
    try {
      log.info("Fetching profile for user:", { userId, retry: retryCount });
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!mountedRef.current) return;

      if (error) {
        if (error.code === 'PGRST116') { // Row not found
          log.info("Profile not found, it may be created by the trigger soon");
          
          // Wait a moment and try again
          if (retryCount < 3) {
            const newRetryCount = retryCount + 1;
            log.info("Retrying profile fetch...", { retryCount: newRetryCount });
            if (mountedRef.current) setRetryCount(newRetryCount);
            
            retryTimerRef.current = setTimeout(() => {
              if (mountedRef.current) {
                fetchProfile(userId);
              }
            }, 1500);
            return;
          } else {
            // We've retried enough, try to create a profile
            if (!profileCreationAttemptedRef.current) {
              log.info("Max retries reached, attempting to create profile");
              profileCreationAttemptedRef.current = true;
              await createProfile(userId);
              return;
            } else {
              log.warn("Profile creation was already attempted but still no profile");
              if (mountedRef.current) setIsLoading(false);
              return;
            }
          }
        }
        
        log.error("Error fetching profile:", { error });
        if (mountedRef.current) setIsLoading(false);
        return;
      }

      log.info("Profile fetched successfully");
      
      // Update profile with Google avatar if available and profile doesn't have one
      if (data && !data.avatar_url && user?.app_metadata?.provider === 'google') {
        const googleAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        
        if (googleAvatarUrl) {
          await updateProfileWithGoogleAvatar(userId, googleAvatarUrl);
          data.avatar_url = googleAvatarUrl;
        }
      }
      
      if (mountedRef.current) {
        setProfile(data);
        setIsLoading(false);
      }
    } catch (error) {
      log.error("Error fetching profile:", { error });
      if (mountedRef.current) setIsLoading(false);
    }
  };

  const createProfile = async (userId: string) => {
    try {
      log.info("Creating profile for user", { userId });
      const { data: userData } = await supabase.auth.getUser();
      
      if (!mountedRef.current) return;

      if (userData?.user) {
        // Get user metadata
        const name = userData.user.user_metadata?.name || 
                    userData.user.user_metadata?.full_name || 
                    userData.user.email?.split('@')[0] || 'משתמש';
        
        const avatarUrl = userData.user.user_metadata?.avatar_url || 
                        userData.user.user_metadata?.picture || 
                        null;
        
        // Try to determine language based on name - if contains Hebrew chars, use he
        const hasHebrewChars = /[\u0590-\u05FF]/.test(name);
        
        // Ensure role is one of the valid enum values
        const defaultRole: RoleType = 'coordinator';

        const newProfile = {
          id: userId,
          name: name,
          email: userData.user.email,
          language: hasHebrewChars ? 'he' : 'en',
          role: defaultRole,
          shabbat_mode: false,
          avatar_url: avatarUrl
        };

        log.info("Creating profile with data:", { profile: newProfile });
        
        const { error: insertError } = await supabase
          .from("profiles")
          .insert(newProfile);
        
        if (!mountedRef.current) return;

        if (insertError) {
          log.error("Error creating profile:", { error: insertError });
          
          // If it's a duplicate key error, try to fetch the profile again
          // This can happen if the trigger created the profile in the meantime
          if (insertError.code === '23505') { // Duplicate key violation
            log.info("Profile may have been created by trigger, fetching again");
            fetchProfile(userId);
            return;
          }
          
          if (mountedRef.current) {
            toast({
              variant: "destructive",
              description: "שגיאה ביצירת פרופיל. אנא נסה להתחבר מחדש.",
            });
            setIsLoading(false);
          }
          return;
        }
        
        log.info("Profile created successfully");
        
        // Fetch the newly created profile
        const { data: newProfileData, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
          
        if (!mountedRef.current) return;

        if (!fetchError && newProfileData) {
          log.info("Fetched newly created profile");
          setProfile(newProfileData);
        } else {
          log.error("Failed to fetch newly created profile", { error: fetchError });
        }
      }
      if (mountedRef.current) setIsLoading(false);
    } catch (createError) {
      log.error("Error in profile creation:", { error: createError });
      if (mountedRef.current) setIsLoading(false);
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
    if (!user?.id || !mountedRef.current) return;
    
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
      if (mountedRef.current) {
        setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
        
        toast({
          description: "תמונת הפרופיל עודכנה בהצלחה",
        });
      }
    } catch (error: any) {
      console.error("Error updating avatar:", error);
      if (mountedRef.current) {
        toast({
          variant: "destructive",
          description: `שגיאה בעדכון תמונת הפרופיל: ${error.message}`,
        });
      }
    }
  };

  return { profile, updateAvatar };
}
