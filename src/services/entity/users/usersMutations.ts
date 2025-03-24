
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/services/supabase/auth';
import type { User, UserCreate, UserUpdate } from '@/types/users';

/**
 * יצירת משתמש חדש
 */
export async function create(userData: UserCreate) {
  console.log('Creating new user:', userData.email);
  
  // ראשית, יצירת משתמש ב-Auth
  const { password, ...userDataWithoutPassword } = userData;
  const authData = await authService.signUp({
    email: userData.email,
    password,
  });
  
  if (!authData.user) {
    throw new Error('שגיאה ביצירת משתמש באימות');
  }
  
  // יצירת רשומת משתמש בטבלת users
  const userId = authData.user.id;
  const { data, error } = await supabase
    .from('users')
    .insert({
      ...userDataWithoutPassword,
      id: userId,
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating user in database:', error);
    // במקרה של שגיאה, ננסה למחוק את המשתמש שנוצר באימות
    await supabase.auth.admin.deleteUser(userId).catch(console.error);
    throw error;
  }
  
  return data as User;
}

/**
 * עדכון משתמש קיים
 */
export async function update(id: string, userData: UserUpdate) {
  console.log(`Updating user ${id}`);
  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
  
  return data as User;
}

/**
 * מחיקת משתמש
 */
export async function deleteUser(id: string) {
  console.log(`Deleting user ${id}`);
  
  // מחיקת נתוני משתמש מבסיס הנתונים
  const { error: dbError } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
    
  if (dbError) {
    console.error(`Error deleting user ${id} from database:`, dbError);
    throw dbError;
  }
  
  // מחיקת המשתמש ממערכת האימות
  await supabase.auth.admin.deleteUser(id).catch(err => {
    console.error(`Error deleting user ${id} from auth:`, err);
  });
  
  return true;
}
