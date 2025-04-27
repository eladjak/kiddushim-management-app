
import { createContext, useContext, ReactNode } from "react";
import { useAuthentication } from "@/services/query/hooks/useAuth";
import { setupStorage } from "@/integrations/supabase/setupStorage";
import { logger } from "@/utils/logger";
import { useEffect, useRef, useState } from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/profile";
import { supabase } from "@/integrations/supabase/client";
import type { AuthContextType } from "@/types/auth";

// יצירת קונטקסט עם ערכי ברירת מחדל
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: () => {},
  updateAvatar: async () => {},
  setUser: () => {},
  setSession: () => {},
  setProfile: () => {},
  setIsLoading: () => {},
});

// ספק האימות
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const log = logger.createLogger({ component: 'AuthContext' });
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [initialSessionChecked, setInitialSessionChecked] = useState(false);
  const mountedRef = useRef(true);
  
  // בדיקת סשן פעיל בטעינה - לסייע בבעיות של החלפת עמודים
  useEffect(() => {
    if (initialSessionChecked) return;
    
    const checkInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          log.error("Error checking initial session:", error);
        } else {
          log.info("Initial session check:", { 
            hasSession: !!data.session, 
            userId: data.session?.user?.id
          });
        }
        
        if (mountedRef.current) {
          setInitialSessionChecked(true);
        }
      } catch (err) {
        log.error("Unexpected error in initial session check:", err);
        if (mountedRef.current) {
          setInitialSessionChecked(true); 
        }
      }
    };
    
    checkInitialSession();
  }, []);
  
  // אתחול אחסון עבור אווטארים
  useEffect(() => {
    const initStorage = async () => {
      if (storageInitialized) return;
      
      try {
        await setupStorage();
        if (mountedRef.current) {
          setStorageInitialized(true);
          log.info("Storage initialized");
        }
      } catch (error) {
        log.error("Failed to setup storage:", { error });
        if (mountedRef.current) {
          setStorageInitialized(true); // מסמן כמאותחל גם במקרה של שגיאה
        }
      }
    };
    
    initStorage();

    return () => {
      mountedRef.current = false;
    };
  }, [storageInitialized]);
  
  // שימוש בהוק האימות המשודרג שלנו
  const auth = useAuthentication();

  // רישום מצב האימות לצורך דיבוג
  useEffect(() => {
    log.info("Auth state changed", { 
      authenticated: auth.isAuthenticated, 
      userId: auth.user?.id,
      hasProfile: !!auth.profile, 
      profileId: auth.profile?.id,
      isLoading: auth.isLoading 
    });
  }, [auth.user, auth.profile, auth.isLoading, auth.isAuthenticated]);

  return (
    <AuthContext.Provider value={{
      ...auth,
      setUser: auth.setUser, 
      setSession: auth.setSession,
      setProfile: auth.setProfile,
      setIsLoading: auth.setIsLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// הוק לשימוש בקונטקסט האימות
export const useAuth = () => {
  return useContext(AuthContext);
};
