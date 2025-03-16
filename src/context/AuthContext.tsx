
import { createContext, useContext, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { useProfile } from "@/hooks/useProfile";
import { useStorage } from "@/hooks/useStorage";
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
  
  // Initialize storage for avatars
  useStorage();
  
  // Handle auth state
  const { user, session, isLoading, setIsLoading } = useAuthState();
  
  // Handle profile management
  const { profile, updateAvatar } = useProfile(user, setIsLoading);

  // Log auth state for debugging
  useEffect(() => {
    log.info("Auth state changed", { 
      authenticated: !!user, 
      hasProfile: !!profile, 
      isLoading 
    });
  }, [user, profile, isLoading]);

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
