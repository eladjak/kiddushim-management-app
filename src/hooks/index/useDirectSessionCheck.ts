
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import type { User } from '@supabase/supabase-js';

// Define the structure of the session info object
export interface DirectSessionInfo {
  hasSession: boolean;
  userId: string | null;
  loading: boolean;
  error: any | null;
}

export function useDirectSessionCheck(user: User | null) {
  const [directSessionInfo, setDirectSessionInfo] = useState<DirectSessionInfo>({
    hasSession: false,
    userId: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const log = logger.createLogger({ component: 'useDirectSessionCheck' });
    
    async function checkSession() {
      try {
        log.info("Checking session directly");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          log.error("Error checking session directly:", error);
          setDirectSessionInfo({
            hasSession: false,
            userId: null,
            loading: false,
            error,
          });
          return;
        }
        
        if (data.session) {
          log.info("Direct session check found session:", {
            userId: data.session.user.id,
            providerType: data.session.user.app_metadata?.provider,
          });
        } else {
          log.info("Direct session check found no session");
        }
        
        setDirectSessionInfo({
          hasSession: !!data.session,
          userId: data.session?.user?.id || null,
          loading: false,
          error: null,
        });
      } catch (err) {
        log.error("Unexpected error in direct session check:", err);
        setDirectSessionInfo({
          hasSession: false,
          userId: null,
          loading: false,
          error: err,
        });
      }
    }
    
    // אם אין משתמש מזוהה, נבדוק אם יש סשן ישירות
    if (!user) {
      checkSession();
    } else {
      // אם יש משתמש, נעדכן את המידע כך שיתאים למשתמש הנוכחי
      setDirectSessionInfo({
        hasSession: true,
        userId: user.id,
        loading: false,
        error: null,
      });
    }
  }, [user]);

  return { directSessionInfo };
}
