
import { createContext, useContext } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { useProfile } from "@/hooks/useProfile";
import { useStorage } from "@/hooks/useStorage";
import type { AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  updateAvatar: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize storage for avatars
  useStorage();
  
  // Handle auth state
  const { user, session, isLoading, setIsLoading } = useAuthState();
  
  // Handle profile management
  const { profile, updateAvatar } = useProfile(user, setIsLoading);

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
