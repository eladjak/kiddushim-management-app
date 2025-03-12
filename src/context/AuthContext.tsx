
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setupStorage } from "@/integrations/supabase/setupStorage";
import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  updateAvatar: (avatarUrl: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  updateAvatar: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'AuthProvider' });

  // Setup storage for avatars
  useEffect(() => {
    setupStorage()
      .catch(error => {
        log.error("Failed to setup storage:", { error });
      });
  }, []);

  useEffect(() => {
    log.info("Auth provider initialized, checking for session...");
    
    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          log.error("Error getting session:", { error });
          setIsLoading(false);
          return;
        }
        
        log.info("Session check result:", data.session ? "Session found" : "No session");
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          await fetchProfile(data.session.user.id);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
      } catch (err) {
        log.error("Unexpected error checking session:", { error: err });
        setIsLoading(false);
      }
    };
    
    checkSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      log.info("Auth state changed:", event, newSession ? "With session" : "No session");
      
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        await fetchProfile(newSession.user.id);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      log.info("Fetching profile for user:", userId);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          log.info("Profile not found, it may be created by the trigger soon");
          // Wait a moment and try again
          setTimeout(async () => {
            const { data: retryData, error: retryError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .single();
              
            if (!retryError) {
              log.info("Profile fetched on retry:", retryData ? "Profile found" : "No profile found");
              setProfile(retryData);
            } else {
              log.error("Error fetching profile on retry:", { error: retryError });
            }
            setIsLoading(false);
          }, 2000);
          return;
        }
        
        log.error("Error fetching profile:", { error });
        setIsLoading(false);
        return;
      }

      log.info("Profile fetched:", data ? "Profile found" : "No profile found");
      
      // Update profile with Google avatar if available and profile doesn't have one
      if (data && !data.avatar_url && user?.app_metadata?.provider === 'google') {
        const googleAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        
        if (googleAvatarUrl) {
          await updateProfileWithGoogleAvatar(userId, googleAvatarUrl);
          data.avatar_url = googleAvatarUrl;
        }
      }
      
      setProfile(data);
      setIsLoading(false);
    } catch (error) {
      log.error("Error fetching profile:", { error });
      setIsLoading(false);
    }
  };

  const updateProfileWithGoogleAvatar = async (userId: string, avatarUrl: string) => {
    try {
      console.log("Updating profile with Google avatar");
      
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;
      
      console.log("Profile updated with Google avatar");
    } catch (error) {
      console.error("Error updating profile with Google avatar:", error);
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString() 
        })
        .eq("id", user.id);

      if (error) throw error;
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      
      toast({
        description: "תמונת הפרופיל עודכנה בהצלחה",
      });
    } catch (error: any) {
      console.error("Error updating avatar:", error);
      toast({
        variant: "destructive",
        description: `שגיאה בעדכון תמונת הפרופיל: ${error.message}`,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
