
import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Json } from "@/integrations/supabase/types";

export interface Profile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: Database["public"]["Enums"]["user_role"];
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
  updateAvatar: (avatarUrl: string) => Promise<void>;
};
