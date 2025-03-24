
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
  
  // יצירת רשומת משתמש בטבלת profiles
  const userId = authData.user.id;
  
  // המרה משדות User לשדות המתאימים לטבלת profiles
  const profileData = {
    id: userId,
    name: userData.full_name,
    email: userData.email,
    phone: userData.phone,
    role: userData.role.toLowerCase(),
  };
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating user in database:', error);
    // במקרה של שגיאה, ננסה למחוק את המשתמש שנוצר באימות
    await supabase.auth.admin.deleteUser(userId).catch(console.error);
    throw error;
  }
  
  return data as unknown as User;
}

/**
 * עדכון משתמש קיים
 */
export async function update(id: string, userData: UserUpdate) {
  console.log(`Updating user ${id}`);
  
  // המרה משדות User לשדות המתאימים לטבלת profiles
  const profileData: Record<string, any> = {};
  
  if (userData.full_name) profileData.name = userData.full_name;
  if (userData.email) profileData.email = userData.email;
  if (userData.phone) profileData.phone = userData.phone;
  if (userData.role) profileData.role = userData.role.toLowerCase();
  if (userData.avatar_url) profileData.avatar_url = userData.avatar_url;
  
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
  
  return data as unknown as User;
}

/**
 * מחיקת משתמש
 */
export async function deleteUser(id: string) {
  console.log(`Deleting user ${id}`);
  
  // מחיקת נתוני משתמש מבסיס הנתונים (לא נדרש למחוק מטבלת profiles 
  // כי יש הגדרת CASCADE DELETION מטבלת auth.users)
  
  // מחיקת המשתמש ממערכת האימות
  const { error } = await supabase.auth.admin.deleteUser(id);
  
  if (error) {
    console.error(`Error deleting user ${id} from auth:`, error);
    throw error;
  }
  
  return true;
}
