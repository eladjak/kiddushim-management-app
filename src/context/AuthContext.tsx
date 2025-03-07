
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setupStorage } from "@/integrations/supabase/setupStorage";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  updateAvatar: (avatarUrl: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  updateAvatar: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Setup storage for avatars
  useEffect(() => {
    setupStorage()
      .catch(error => {
        console.error("Failed to setup storage:", error);
      });
  }, []);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      // Update profile with Google avatar if available and profile doesn't have one
      if (data && !data.avatar_url && user?.app_metadata?.provider === 'google') {
        const googleAvatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        
        if (googleAvatarUrl) {
          await updateProfileWithGoogleAvatar(userId, googleAvatarUrl);
          data.avatar_url = googleAvatarUrl;
        }
      }
      
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileWithGoogleAvatar = async (userId: string, avatarUrl: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;
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
    <AuthContext.Provider value={{ user, profile, isLoading, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
