import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { useProfile } from "@/hooks/useProfile";
import { setupStorage } from "@/integrations/supabase/setupStorage";
import { logger } from "@/utils/logger";
import type { AuthContextType } from "@/types/auth";

// Create the auth context with default values
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
  
  // Initialize storage for avatars - once only and early
  useEffect(() => {
    let mounted = true;
    
    setupStorage()
      .then(() => {
        if (mounted) {
          setStorageInitialized(true);
          log.info("Storage initialized");
        }
      })
      .catch(error => {
        log.error("Failed to setup storage:", { error });
        if (mounted) setStorageInitialized(true); // Mark as initialized even on error
      });
      
    return () => {
      mounted = false;
    };
  }, []);
  
  // Handle auth state
  const { user, session, isLoading, setIsLoading } = useAuthState();
  
  // Handle profile management - wrapping in useCallback
  const updateAvatar = useCallback(async (avatarUrl: string) => {
    // Implementation will be provided by the useProfile hook
  }, []);
  
  // Keep profile handling separate with its own dependency array
  const { profile, updateAvatar: updateAvatarImpl } = useProfile(user, setIsLoading);
  
  // Assign the implementation to our callback
  useEffect(() => {
    updateAvatar.implementation = updateAvatarImpl;
  }, [updateAvatar, updateAvatarImpl]);

  // Log auth state changes
  useEffect(() => {
    let mounted = true;
    
    log.info("Auth state changed", { 
      authenticated: !!user, 
      hasProfile: !!profile, 
      isLoading 
    });
    
    // Force loading to complete after a maximum time
    const timeoutDuration = 2000; // 2 seconds max loading time
    const timeout = setTimeout(() => {
      if (mounted && isLoading) {
        log.warn("Forcing auth loading to complete after timeout");
        setIsLoading(false);
      }
    }, timeoutDuration);
    
    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [user, profile, isLoading, setIsLoading]);

  const value = {
    user,
    session,
    profile,
    isLoading,
    updateAvatar: updateAvatarImpl
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
