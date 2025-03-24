
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { useProfile } from "@/hooks/useProfile";
import { setupStorage } from "@/integrations/supabase/setupStorage";
import { logger } from "@/utils/logger";
import type { AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  updateAvatar: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const log = logger.createLogger({ component: 'AuthContext' });
  const [storageInitialized, setStorageInitialized] = useState(false);
  const mountedRef = useRef(true);
  
  // Initialize storage for avatars
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
          setStorageInitialized(true); // Mark as initialized even on error
        }
      }
    };
    
    initStorage();

    return () => {
      mountedRef.current = false;
    };
  }, [storageInitialized]);
  
  // Handle auth state - independent of storage initialization
  const { user, session, isLoading, setIsLoading } = useAuthState();
  
  // Handle profile management - convert the updateAvatar return type to void
  const { profile, updateAvatar: originalUpdateAvatar } = useProfile(user, setIsLoading);
  
  // Wrap the updateAvatar function to convert its return type from Promise<boolean> to Promise<void>
  const updateAvatar = async (avatarUrl: string): Promise<void> => {
    await originalUpdateAvatar(avatarUrl);
  };

  // Log auth state for debugging - super useful for debugging auth issues
  useEffect(() => {
    log.info("Auth state changed", { 
      authenticated: !!user, 
      userId: user?.id,
      hasProfile: !!profile, 
      profileId: profile?.id,
      isLoading 
    });
    
    // Force loading to complete after a maximum time
    if (isLoading) {
      const timeout = setTimeout(() => {
        if (isLoading && mountedRef.current) {
          log.warn("Forcing auth loading to complete after timeout");
          setIsLoading(false);
        }
      }, 2500); // 2.5 seconds max loading time
      
      return () => clearTimeout(timeout);
    }
  }, [user, profile, isLoading, setIsLoading]);

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
