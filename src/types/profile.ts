/**
 * טיפוסים עבור פרופיל משתמש
 */

import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  phone?: string | null;
  role: Database["public"]["Enums"]["user_role"];
  created_at: string;
  updated_at?: string;
  settings?: Record<string, any> | null;
  notification_settings?: Record<string, any> | null;
  last_active?: string | null;
  language?: string | null;
  shabbat_mode?: boolean | null;
}
