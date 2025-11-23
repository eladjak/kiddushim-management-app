
// Changing the import to avoid the "not a module" error
import type { Json } from '../integrations/supabase/types';

// התפקידים זהים ל-app_role enum בבסיס הנתונים
export type RoleType = 'admin' | 'coordinator' | 'service_girl' | 'youth_volunteer' | 'volunteer';

// נשתמש ב-Profile מ-auth.ts כדי לאחד את הטיפוסים
export type { Profile as UserProfile, AppRole } from './auth';

export type UserRole = RoleType;
