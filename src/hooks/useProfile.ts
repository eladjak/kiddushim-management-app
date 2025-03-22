
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/auth";

export function useProfile(user: User | null, setIsLoading: (value: boolean) => void) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'useProfile' });
  const mountedRef = useRef(true);

  useEffect(() => {
    // Set mounted flag
    mountedRef.current = true;
    
    let profileCreationAttempted = false;
    
    const fetchProfile = async () => {
      try {
        log.info("Attempting to fetch profile");
        
        if (!user?.id || !mountedRef.current) return;
        
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116' && !profileCreationAttempted && mountedRef.current) { // Row not found
            log.info("Profile not found, creating one immediately");
            profileCreationAttempted = true;
            await createBasicProfile(user.id);
            return;
          }
          
          log.error("Error fetching profile:", { error });
          if (mountedRef.current) setIsLoading(false);
          return;
        }

        log.info("Profile fetched successfully");
        
        // Update profile with Google avatar if available and profile doesn't have one
        if (data && !data.avatar_url && user.app_metadata?.provider === 'google') {
          const googleAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
          
          if (googleAvatarUrl && mountedRef.current) {
            await updateProfileWithGoogleAvatar(user.id, googleAvatarUrl);
            data.avatar_url = googleAvatarUrl;
          }
        }
        
        if (mountedRef.current) {
          setProfile(data);
          setIsLoading(false);
        }
      } catch (error) {
        log.error("Error in profile fetch:", { error });
        if (mountedRef.current) setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      if (mountedRef.current) setIsLoading(false);
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [user, setIsLoading]);

  const createBasicProfile = async (userId: string) => {
    try {
      log.info("Creating basic profile for user", { userId });
      if (!mountedRef.current) return;
      
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        // Get user metadata
        const name = userData.user.user_metadata?.name || 
                    userData.user.user_metadata?.full_name || 
                    userData.user.email?.split('@')[0] || 'משתמש';
        
        // Try to determine language based on name - if contains Hebrew chars, use he
        const hasHebrewChars = /[\u0590-\u05FF]/.test(name);
        
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            name: name,
            email: userData.user.email,
            language: hasHebrewChars ? 'he' : 'en',
            role: 'coordinator', // Default role
            shabbat_mode: false
          });
        
        if (!insertError && mountedRef.current) {
          log.info("Created basic profile for user", { userId });
          
          // Fetch the newly created profile
          const { data: newProfile, error: fetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
            
          if (!fetchError && newProfile && mountedRef.current) {
            log.info("Fetched newly created profile", { profile: newProfile });
            setProfile(newProfile);
            setIsLoading(false);
          } else {
            log.error("Failed to fetch newly created profile", { error: fetchError });
            if (mountedRef.current) setIsLoading(false);
          }
        } else {
          log.error("Error creating basic profile:", { error: insertError });
          if (mountedRef.current) {
            toast({
              variant: "destructive",
              description: "שגיאה ביצירת פרופיל. אנא נסה להתחבר מחדש.",
            });
            setIsLoading(false);
          }
        }
      } else {
        log.error("No user data available for profile creation");
        if (mountedRef.current) setIsLoading(false);
      }
    } catch (createError) {
      log.error("Error in profile creation:", { error: createError });
      if (mountedRef.current) setIsLoading(false);
    }
  };

  const updateProfileWithGoogleAvatar = async (userId: string, avatarUrl: string) => {
    try {
      if (!mountedRef.current) return;
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
