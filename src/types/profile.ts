
/**
 * טיפוסים עבור פרופיל משתמש
 */

import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// הגדרת סוגי תפקידים
export type RoleType = "admin" | "coordinator" | "youth_volunteer" | "service_girl" | "content_provider";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;  // שינוי מ-optional ל-nullable
  phone?: string | null;
  role: RoleType;
  created_at: string;
  updated_at?: string | null;
  settings?: Record<string, any> | null;
  notification_settings?: Record<string, any> | null;
  last_active?: string | null;
  language: string | null;  // שינוי מ-optional ל-nullable
  shabbat_mode: boolean | null;  // שינוי מ-optional ל-nullable
  encoding_support: boolean;  // שדה חובה
}
