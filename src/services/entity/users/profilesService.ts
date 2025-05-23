import { supabase } from '@/integrations/supabase/client';
import type { UserProfile, RoleType } from '@/types/profile';

/**
 * קבלת פרופיל משתמש מורחב
 */
export async function getProfile(id: string): Promise<UserProfile> {
  console.log(`Fetching user profile for id: ${id}`);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`Error fetching user profile ${id}:`, error);
    throw error;
  }
  
  // המרה לטיפוס UserProfile עם כל השדות הנדרשים
  return {
    id: data.id,
    email: data.email || null,
    name: data.name,
    avatar_url: data.avatar_url || null,
    phone: data.phone || null,
    role: data.role,
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
export async function updateProfile(id: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
  console.log(`Updating profile for user ${id}`);
  
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
    console.error(`Error updating user profile ${id}:`, error);
    throw error;
  }
  
  // המרה לטיפוס UserProfile עם כל השדות הנדרשים
  return {
    id: data.id,
    email: data.email || null,
    name: data.name,
    avatar_url: data.avatar_url || null,
    phone: data.phone || null,
    role: data.role,
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
 * עדכון תפקיד משתמש
 */
export async function updateRole(id: string, role: RoleType): Promise<UserProfile> {
  console.log(`Updating role for user ${id} to ${role}`);
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      role,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Error updating user role ${id}:`, error);
    throw error;
  }
  
  // המרה לטיפוס UserProfile עם כל השדות הנדרשים
  return {
    id: data.id,
    email: data.email || null,
    name: data.name,
    avatar_url: data.avatar_url || null,
    phone: data.phone || null,
    role: data.role,
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
 * בדיקה האם פרופיל קיים
 */
export async function checkProfileExists(id: string): Promise<boolean> {
  console.log(`Checking if profile exists for user ${id}`);
  
  try {
    const { data, error, count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('id', id);
      
    if (error) {
      console.error(`Error checking if profile exists for ${id}:`, error);
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
    console.error(`Unexpected error checking if profile exists for ${id}:`, err);
    // For unexpected errors, we assume the profile doesn't exist to trigger creation
    return false;
  }
}
