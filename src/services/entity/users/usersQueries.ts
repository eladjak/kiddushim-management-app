
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types/users';

/**
 * קבלת כל המשתמשים
 */
export async function getAll() {
  console.log('Fetching all users');
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('full_name', { ascending: true });
    
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  
  return data as User[];
}

/**
 * קבלת משתמש לפי מזהה
 */
export async function getById(id: string) {
  console.log(`Fetching user with id: ${id}`);
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
  
  return data as User;
}

/**
 * חיפוש משתמשים לפי שם או אימייל
 */
export async function search(query: string) {
  console.log(`Searching users with query: ${query}`);
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('full_name', { ascending: true });
    
  if (error) {
    console.error('Error searching users:', error);
    throw error;
  }
  
  return data as User[];
}
