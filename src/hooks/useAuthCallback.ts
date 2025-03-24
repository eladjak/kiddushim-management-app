
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { checkAndSetAdminStatus } from "@/lib/admin-utils";
import { useSessionManager } from "@/hooks/auth/useSessionManager";
import { useProfileManager } from "@/hooks/auth/useProfileManager";
import { supabase } from "@/integrations/supabase/client";

export function useAuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'useAuthCallback' });
  const mountedRef = useRef(true);
  const processedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // שימוש בהוקים המודולריים שלנו
  const { getSession, cleanUrlHash, error, setError } = useSessionManager();
  const { checkProfile, createProfile } = useProfileManager();

  useEffect(() => {
    // הימנעות מעיבוד כפול
    if (processedRef.current) return;
    processedRef.current = true;
    
    // טיפול בקריאה חוזרת מאימות OAuth
    const handleAuthCallback = async () => {
      try {
        log.info("מעבד קריאה חוזרת מאימות");
        
        // ניסיון לקבל סשן
        const session = await getSession();
        
        if (!mountedRef.current) return;
        if (!session) {
          setIsProcessing(false);
          return;
        }
        
        // קבלת פרטי משתמש ליצירת פרופיל
        const userId = session.user.id;
        const userEmail = session.user.email;
        const userName = session.user.user_metadata?.name || 
                        session.user.user_metadata?.full_name || 
                        userEmail?.split('@')[0] || 'משתמש';
        const avatarUrl = session.user.user_metadata?.avatar_url || 
                        session.user.user_metadata?.picture;
        
        // המתנה קצרה כדי לאפשר לטריגר ליצור את הפרופיל
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // בדיקה אם הפרופיל כבר קיים
        try {
          // ניסיון ישיר לבדוק אם יש פרופיל
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
            
          if (profileError) {
            log.error("שגיאה בבדיקת פרופיל:", { profileError });
          }
          
          // אם אין פרופיל, ננסה ליצור אחד
          if (!existingProfile && mountedRef.current) {
            log.info("פרופיל לא נמצא, יוצר פרופיל חדש");
            
            // ניסיון ליצור פרופיל חדש
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                name: userName,
                email: userEmail,
                role: 'coordinator',
                avatar_url: avatarUrl,
                language: 'he',
                shabbat_mode: false,
                encoding_support: true
              })
              .select()
              .single();
              
            if (insertError) {
              log.error("שגיאה ביצירת פרופיל:", { insertError });
            } else {
              log.info("פרופיל נוצר בהצלחה:", { profileId: newProfile?.id });
            }
          } else {
            log.info("פרופיל קיים, ממשיך");
          }
        } catch (profileErr) {
          log.error("שגיאה לא צפויה בטיפול בפרופיל:", { profileErr });
        }
          
        if (!mountedRef.current) return;

        // ניקוי URL hash למניעת עיבוד מחדש בטעינה מחדש של הדף
        cleanUrlHash();

        // אימות מוצלח, הצגת הודעה
        toast({
          description: "התחברת בהצלחה!",
        });
        
        // ודא שאנחנו מפנים בדיוק לנתיב דף הבית עם רענון מלא
        window.location.href = "/";
      } catch (err: any) {
        log.error("שגיאה לא צפויה בעיבוד קריאה חוזרת מאימות:", { error: err });
        if (mountedRef.current) {
          setError(err.message || "שגיאה לא צפויה התרחשה במהלך ההתחברות");
          setIsProcessing(false);
        }
      }
    };

    handleAuthCallback();

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [navigate, toast]);

  return { error, isProcessing };
}
