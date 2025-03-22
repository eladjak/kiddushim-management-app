
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
    let isMounted = true;
    let profileCreationAttempted = false;
    
    const fetchProfile = async () => {
      try {
        log.info("Attempting to fetch profile");
        
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user?.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116' && !profileCreationAttempted) { // Row not found
            log.info("Profile not found, creating one immediately");
            profileCreationAttempted = true;
            await createBasicProfile(user?.id as string);
            return;
          }
          
          log.error("Error fetching profile:", { error });
          if (isMounted) setIsLoading(false);
          return;
        }

        log.info("Profile fetched successfully");
        
        // Update profile with Google avatar if available and profile doesn't have one
        if (data && !data.avatar_url && user?.app_metadata?.provider === 'google') {
          const googleAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
          
          if (googleAvatarUrl) {
            await updateProfileWithGoogleAvatar(user.id, googleAvatarUrl);
            data.avatar_url = googleAvatarUrl;
          }
        }
        
        if (isMounted) {
          setProfile(data);
          setIsLoading(false);
        }
      } catch (error) {
        log.error("Error in profile fetch:", { error });
        if (isMounted) setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setIsLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, setIsLoading]);

  const createBasicProfile = async (userId: string) => {
    try {
      log.info("Creating basic profile for user", { userId });
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
        
        if (!insertError) {
          log.info("Created basic profile for user", { userId });
          
          // Fetch the newly created profile
          const { data: newProfile, error: fetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
            
          if (!fetchError && newProfile) {
            log.info("Fetched newly created profile", { profile: newProfile });
            setProfile(newProfile);
            setIsLoading(false);
          } else {
            log.error("Failed to fetch newly created profile", { error: fetchError });
            setIsLoading(false);
          }
        } else {
          log.error("Error creating basic profile:", { error: insertError });
          toast({
            variant: "destructive",
            description: "שגיאה ביצירת פרופיל. אנא נסה להתחבר מחדש.",
          });
          setIsLoading(false);
        }
      } else {
        log.error("No user data available for profile creation");
        setIsLoading(false);
      }
    } catch (createError) {
      log.error("Error in profile creation:", { error: createError });
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
