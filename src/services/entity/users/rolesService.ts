import { supabase } from '@/integrations/supabase/client';
import type { RoleType } from '@/types/profile';
import { logger } from '@/utils/logger';

const log = logger.createLogger({ component: 'RolesService' });

export type AppRole = 'admin' | 'coordinator' | 'service_girl' | 'youth_volunteer' | 'volunteer';

/**
 * קבלת תפקיד משתמש
 */
export async function getUserRole(userId: string): Promise<AppRole | null> {
  log.debug(`Fetching role for user: ${userId}`);

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    log.error(`Error fetching user role ${userId}`, { error });
    throw error;
  }

  return data?.role || null;
}

/**
 * בדיקה האם למשתמש יש תפקיד מסוים
 */
export async function hasRole(userId: string, role: AppRole): Promise<boolean> {
  log.debug(`Checking if user ${userId} has role: ${role}`);

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle();

  if (error) {
    log.error(`Error checking role for user ${userId}`, { error });
    return false;
  }

  return !!data;
}

/**
 * בדיקה האם משתמש הוא צוות (admin או coordinator)
 */
export async function isStaff(userId: string): Promise<boolean> {
  log.debug(`Checking if user ${userId} is staff`);

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['admin', 'coordinator'])
    .maybeSingle();

  if (error) {
    log.error(`Error checking staff status for user ${userId}`, { error });
    return false;
  }

  return !!data;
}

/**
 * עדכון תפקיד משתמש (רק admins יכולים)
 */
export async function updateUserRole(
  userId: string,
  newRole: AppRole,
  assignedBy?: string
): Promise<void> {
  log.debug(`Updating role for user ${userId} to ${newRole}`, { action: 'updateUserRole' });

  // שימוש ב-upsert במקום delete+insert כדי למנוע race condition
  const { error } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role: newRole,
      assigned_by: assignedBy
    }, { onConflict: 'user_id' });

  if (error) {
    log.error(`Error updating role for user ${userId}`, { error });
    throw error;
  }

  log.info(`Successfully updated role for user ${userId} to ${newRole}`);
}

/**
 * קבלת כל התפקידים במערכת
 */
export async function getAllUserRoles(): Promise<Array<{ user_id: string; role: AppRole }>> {
  log.debug('Fetching all user roles');

  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .order('created_at', { ascending: false });

  if (error) {
    log.error('Error fetching all user roles', { error });
    throw error;
  }

  return data || [];
}
