
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { RoleType } from "@/types/profile";

/**
 * Hook to handle manual profile creation
 */
export const useProfileCreation = (user: User | null) => {
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [creationAttempts, setCreationAttempts] = useState(0);
  const log = logger.createLogger({ component: 'useProfileCreation' });
  const { toast } = useToast();

  const createProfileManually = async () => {
    if (!user || isCreatingProfile) return;
    
    try {
      setIsCreatingProfile(true);
      setCreationAttempts(prev => prev + 1);
      
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
        
      if (existingProfile) {
        toast({
          description: "הפרופיל כבר קיים, מרענן את הדף...",
        });
        window.location.reload();
        return;
      }
      
      const defaultRole: RoleType = 'coordinator';
      
      // Create new profile with explicit role type
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          name: user.user_metadata?.name || 
               user.user_metadata?.full_name || 
               user.email?.split('@')[0] || 'משתמש',
          email: user.email,
          language: 'he',
          role: defaultRole,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          shabbat_mode: false,
          encoding_support: true // הוספת שדה חסר
        });
        
      if (error) {
        if (error.code === '23505') {
          toast({
            description: "הפרופיל כבר קיים, מרענן את הדף...",
          });
          window.location.reload();
        } else {
          throw error;
        }
      } else {
        toast({
          description: "פרופיל נוצר בהצלחה, מרענן את הדף...",
        });
        
        // Wait a moment for the profile to be properly saved
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: any) {
      log.error("Error creating profile manually:", { error });
      toast({
        variant: "destructive",
        description: `שגיאה ביצירת פרופיל: ${error.message}`,
      });
    } finally {
      if (isCreatingProfile) {
        setIsCreatingProfile(false);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear any local storage items that might be causing issues
      localStorage.clear();
      // Redirect to auth page
      window.location.href = "/auth";
    } catch (error) {
      console.error("Error signing out:", error);
      // Force reload as a fallback
      window.location.href = "/auth";
    }
  };

  return {
    isCreatingProfile,
    creationAttempts,
    createProfileManually,
    handleSignOut
  };
};
