
// Changing the import to avoid the "not a module" error
import type { Json } from '../integrations/supabase/types';

export type RoleType = 'admin' | 'coordinator' | 'service_girl' | 'youth_volunteer' | 'content_provider';

export interface UserProfile {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar_url: string | null; // Changed from optional to required with null as possible value
  role: RoleType;
  created_at: string;
  updated_at: string;
  settings: Json;
  notification_settings: Json;
  last_active: string | null;
  language: string;
  shabbat_mode: boolean;
  encoding_support: boolean;
}

export type UserRole = RoleType;
