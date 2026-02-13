
import type { User, Session } from "@supabase/supabase-js";
import type { Json } from "@/integrations/supabase/types";

// טיפוס התפקיד החדש - תואם ל-app_role enum שיצרנו
export type AppRole = 'admin' | 'coordinator' | 'service_girl' | 'youth_volunteer' | 'volunteer';

export interface Profile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AppRole | null; // התפקיד עכשיו מגיע מטבלת user_roles ויכול להיות null
  created_at: string;
  updated_at: string;
  settings: Json;
  notification_settings: Json;
  last_active: string | null;
  language: string;
  shabbat_mode: boolean;
  encoding_support: boolean;
}

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => void;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setIsLoading: (loading: boolean) => void;
};
