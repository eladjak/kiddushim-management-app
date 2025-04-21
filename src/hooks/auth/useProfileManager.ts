
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { RoleType } from "@/types/profile";

/**
 * Hook לניהול פרופיל משתמש
 */
export function useProfileManager() {
  const [error, setError] = useState<string | null>(null);
  const log = logger.createLogger({ component: 'useProfileManager' });

  /**
   * בדיקה אם פרופיל קיים
   */
  const checkProfile = async (userId: string) => {
    try {
      log.info("בודק פרופיל עבור משתמש:", { userId });
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId as any)
        .maybeSingle();
      
      if (error) {
        log.error("שגיאה בקבלת פרופיל:", { error });
        setError(error.message);
        return null;
      }
      
      log.info("תוצאת בדיקת פרופיל:", { hasProfile: !!data });
      return data;
    } catch (err: any) {
      log.error("שגיאה לא צפויה בבדיקת פרופיל:", { error: err });
      setError(err.message || "שגיאה לא צפויה בבדיקת פרופיל");
      return null;
    }
  };

  /**
   * יצירת פרופיל חדש
   */
  const createProfile = async (userId: string, userName: string, userEmail: string | undefined, avatarUrl: string | undefined) => {
    try {
      log.info("יוצר פרופיל חדש עבור משתמש:", { userId });
      
      // בדיקה שוב שהפרופיל לא קיים כבר
      const existingProfile = await checkProfile(userId);
      if (existingProfile) {
        log.info("פרופיל כבר קיים, אין צורך ליצור חדש");
        return existingProfile;
      }
      
      const defaultRole: RoleType = 'coordinator';
      
      // יצירת אובייקט פרופיל חדש עם כל השדות החובה - use type assertion
      const profileData = {
        id: userId as any,
        name: userName,
        email: userEmail,
        role: defaultRole as any,
        avatar_url: avatarUrl || null,
        language: 'he',
        shabbat_mode: false,
        encoding_support: true,
        settings: {},
        notification_settings: {}
      } as any;
      
      log.info("מנסה ליצור פרופיל עם נתונים:", profileData);
      
      const { data, error } = await supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single();
      
      if (error) {
        // אם השגיאה היא שהפרופיל כבר קיים, נבדוק שוב
        if (error.code === '23505') { // שגיאת דופליקט
          log.info("פרופיל נוצר כבר, מנסה לקבל אותו");
          return await checkProfile(userId);
        }
        
        log.error("שגיאה ביצירת פרופיל:", { error });
        setError(error.message);
        return null;
      }
      
      log.info("פרופיל נוצר בהצלחה");
      return data;
    } catch (err: any) {
      log.error("שגיאה לא צפויה ביצירת פרופיל:", { error: err });
      setError(err.message || "שגיאה לא צפויה ביצירת פרופיל");
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
