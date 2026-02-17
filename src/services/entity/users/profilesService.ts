import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types/auth';
import type { RoleType } from '@/types/profile';
import { getUserRole } from './rolesService';
import { logger } from '@/utils/logger';

const log = logger.createLogger({ component: 'ProfilesService' });

/**
 * קבלת פרופיל משתמש מורחב
 */
export async function getProfile(id: string): Promise<Profile> {
  log.debug(`Fetching user profile for id: ${id}`);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    log.error(`Error fetching user profile ${id}`, { error });
    throw error;
  }

  // קבלת התפקיד מטבלת user_roles
  let role: RoleType | null = null;
  try {
    role = await getUserRole(id);
  } catch (err) {
    log.error(`Error fetching role for user ${id}`, { error: err });
  }

  // המרה לטיפוס Profile עם כל השדות הנדרשים
  return {
    id: data.id,
    email: data.email || null,
    name: data.name,
    avatar_url: data.avatar_url || null,
    phone: data.phone || null,
    role: role,
    created_at: data.created_at,
    updated_at: data.updated_at,
    settings: data.settings || {},
    notification_settings: data.notification_settings || {},
    last_active: data.last_active || null,
    language: data.language || 'he',
    shabbat_mode: data.shabbat_mode || false,
    encoding_support: data.encoding_support || true
  };
}

/**
 * עדכון פרופיל משתמש
 */
export async function updateProfile(id: string, profileData: Partial<Profile>): Promise<Profile> {
  log.debug(`Updating profile for user ${id}`, { action: 'updateProfile' });

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    log.error(`Error updating user profile ${id}`, { error });
    throw error;
  }

  // קבלת התפקיד מטבלת user_roles
  let role: RoleType | null = null;
  try {
    role = await getUserRole(id);
  } catch (err) {
    log.error(`Error fetching role for user ${id}`, { error: err });
  }

  // המרה לטיפוס Profile עם כל השדות הנדרשים
  return {
    id: data.id,
    email: data.email || null,
    name: data.name,
    avatar_url: data.avatar_url || null,
    phone: data.phone || null,
    role: role,
    created_at: data.created_at,
    updated_at: data.updated_at,
    settings: data.settings || {},
    notification_settings: data.notification_settings || {},
    last_active: data.last_active || null,
    language: data.language || 'he',
    shabbat_mode: data.shabbat_mode || false,
    encoding_support: data.encoding_support || true
  };
}

/**
 * עדכון תפקיד משתמש - עכשיו משתמש ב-user_roles
 */
export async function updateRole(id: string, role: RoleType): Promise<Profile> {
  log.debug(`Updating role for user ${id} to ${role}`, { action: 'updateRole' });

  // עדכון התפקיד בטבלת user_roles
  const { updateUserRole } = await import('./rolesService');
  await updateUserRole(id, role);

  // קבלת הפרופיל המעודכן
  return getProfile(id);
}

/**
 * בדיקה האם פרופיל קיים
 */
export async function checkProfileExists(id: string): Promise<boolean> {
  log.debug(`Checking if profile exists for user ${id}`);

  try {
    const { data, error, count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('id', id);

    if (error) {
      log.error(`Error checking if profile exists for ${id}`, { error });
      // Return false for RLS-related errors to trigger attempt at profile creation
      if (error.message?.includes('violates row-level security') ||
          error.code === '42501' || // permission_denied
          error.code === '403') {   // forbidden
        return false;
      }

      throw error; // Propagate other errors
    }

    return (count || 0) > 0;
  } catch (err) {
    log.error(`Unexpected error checking if profile exists for ${id}`, { error: err });
    // For unexpected errors, we assume the profile doesn't exist to trigger creation
    return false;
  }
}
