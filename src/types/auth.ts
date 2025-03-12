
import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  updateAvatar: (avatarUrl: string) => Promise<void>;
};
