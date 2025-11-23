import { supabase } from '@/integrations/supabase/client';
import type { RoleType } from '@/types/profile';

export type AppRole = 'admin' | 'coordinator' | 'service_girl' | 'youth_volunteer' | 'volunteer';

/**
 * קבלת תפקיד משתמש
 */
export async function getUserRole(userId: string): Promise<AppRole | null> {
  console.log(`Fetching role for user: ${userId}`);
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (error) {
    console.error(`Error fetching user role ${userId}:`, error);
    throw error;
  }
  
  return data?.role || null;
}

/**
 * בדיקה האם למשתמש יש תפקיד מסוים
 */
export async function hasRole(userId: string, role: AppRole): Promise<boolean> {
  console.log(`Checking if user ${userId} has role: ${role}`);
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle();
    
  if (error) {
    console.error(`Error checking role for user ${userId}:`, error);
    return false;
  }
  
  return !!data;
}

/**
 * בדיקה האם משתמש הוא צוות (admin או coordinator)
 */
export async function isStaff(userId: string): Promise<boolean> {
  console.log(`Checking if user ${userId} is staff`);
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['admin', 'coordinator'])
    .maybeSingle();
    
  if (error) {
    console.error(`Error checking staff status for user ${userId}:`, error);
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
  console.log(`Updating role for user ${userId} to ${newRole}`);
  
  // מחיקת תפקיד ישן
  const { error: deleteError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);
    
  if (deleteError) {
    console.error(`Error deleting old role for user ${userId}:`, deleteError);
    throw deleteError;
  }
  
  // הוספת תפקיד חדש
  const { error: insertError } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: newRole,
      assigned_by: assignedBy
    });
    
  if (insertError) {
    console.error(`Error inserting new role for user ${userId}:`, insertError);
    throw insertError;
  }
  
  console.log(`Successfully updated role for user ${userId} to ${newRole}`);
}

/**
 * קבלת כל התפקידים במערכת
 */
export async function getAllUserRoles(): Promise<Array<{ user_id: string; role: AppRole }>> {
  console.log('Fetching all user roles');
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching all user roles:', error);
    throw error;
  }
  
  return data || [];
}
