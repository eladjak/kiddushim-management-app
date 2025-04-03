
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { User } from "@supabase/supabase-js";

export const useDirectSessionCheck = (user: User | null) => {
  const [directSessionInfo, setDirectSessionInfo] = useState<string | null>(null);
  const sessionCheckedRef = useRef(false);
  const log = logger.createLogger({ component: 'useDirectSessionCheck' });

  useEffect(() => {
    if (sessionCheckedRef.current) return;
    sessionCheckedRef.current = true;
    
    const checkSession = async () => {
      log.info("Performing initial session check on index page");
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          log.error("Error checking session on index page:", error);
          setDirectSessionInfo("שגיאה בבדיקת הסשן: " + error.message);
          return;
        }
        
        const sessionInfo = {
          hasSession: !!data.session,
          currentUser: !!user,
          sessionUserId: data.session?.user?.id,
          contextUserId: user?.id
        };
        
        log.info("Index page direct session check:", sessionInfo);
        setDirectSessionInfo(
          "מידע ישיר מהסשן: " + 
          (data.session ? "יש סשן" : "אין סשן") + 
          (data.session?.user ? `, ID: ${data.session.user.id.slice(0, 6)}...` : "")
        );
        
        // If we have a session but user isn't set in context, force reload
        if (data.session && !user) {
          log.info("Session exists but user not in context, forcing reload");
          window.location.reload();
        }
      } catch (err) {
        log.error("Error in direct session check:", err);
        setDirectSessionInfo("שגיאה בבדיקת הסשן הישירה");
      }
    };
    
    checkSession();
  }, [user]);

  return { directSessionInfo };
};
