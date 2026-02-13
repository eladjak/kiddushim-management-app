
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types/users';
import { logger } from '@/utils/logger';

const log = logger.createLogger({ component: 'UsersQueries' });

/**
 * קבלת כל המשתמשים
 */
export async function getAll() {
  log.debug('Fetching all users');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    log.error('Error fetching users', { error });
    throw error;
  }

  return data as unknown as User[];
}

/**
 * קבלת משתמש לפי מזהה
 */
export async function getById(id: string) {
  log.debug(`Fetching user with id: ${id}`);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    log.error(`Error fetching user ${id}`, { error });
    throw error;
  }

  return data as unknown as User;
}

/**
 * חיפוש משתמשים לפי שם או אימייל
 */
export async function search(query: string) {
  log.debug(`Searching users with query: ${query}`);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('name', { ascending: true });

  if (error) {
    log.error('Error searching users', { error });
    throw error;
  }

  return data as unknown as User[];
}
