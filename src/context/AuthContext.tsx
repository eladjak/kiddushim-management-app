import { createContext, useContext, ReactNode } from "react";
import { useAuthentication } from "@/services/query/hooks/useAuth";
import { setupStorage } from "@/integrations/supabase/setupStorage";
import { logger } from "@/utils/logger";
import { useEffect, useRef, useState } from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/profile";

// טיפוס עבור קונטקסט האימות
interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => void;
  updateAvatar: (url: string) => void;
}

// יצירת קונטקסט עם ערכי ברירת מחדל
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: () => {},
  updateAvatar: () => {},
});

// ספק האימות
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const log = logger.createLogger({ component: 'AuthContext' });
  const [storageInitialized, setStorageInitialized] = useState(false);
  const mountedRef = useRef(true);
  
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
    <AuthContext.Provider value={auth as AuthContextType}>
      {children}
    </AuthContext.Provider>
  );
};

// הוק לשימוש בקונטקסט האימות
export const useAuth = () => {
  return useContext(AuthContext);
};
