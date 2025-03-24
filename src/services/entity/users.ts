import { supabase } from '../supabase/client';
import type { User, UserCreate, UserUpdate } from '@/types/users';
import type { UserProfile } from '@/types/profile';
import { authService } from '../supabase/auth';

/**
 * שירות לניהול משתמשים
 */
export const usersService = {
  /**
   * קבלת כל המשתמשים
   */
  async getAll() {
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
  },
  
  /**
   * קבלת משתמש לפי מזהה
   */
  async getById(id: string) {
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
  },
  
  /**
   * קבלת פרופיל משתמש מורחב
   */
  async getProfile(id: string): Promise<UserProfile> {
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
    
    // המרה לטיפוס UserProfile
    return {
      id: data.id,
      email: data.email || '',
      name: data.name,
      avatar_url: data.avatar_url,
      phone: data.phone,
      role: data.role,
      created_at: data.created_at,
      updated_at: data.updated_at,
      settings: data.settings,
      notification_settings: data.notification_settings,
      last_active: data.last_active,
      language: data.language,
      shabbat_mode: data.shabbat_mode
    };
  },
  
  /**
   * יצירת משתמש חדש
   */
  async create(userData: UserCreate) {
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
  },
  
  /**
   * עדכון משתמש קיים
   */
  async update(id: string, userData: UserUpdate) {
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
  },
  
  /**
   * עדכון פרופיל משתמש
   */
  async updateProfile(id: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    console.log(`Updating profile for user ${id}`);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating user profile ${id}:`, error);
      throw error;
    }
    
    // המרה לטיפוס UserProfile
    return {
      id: data.id,
      email: data.email || '',
      name: data.name,
      avatar_url: data.avatar_url,
      phone: data.phone,
      role: data.role,
      created_at: data.created_at,
      updated_at: data.updated_at,
      settings: data.settings,
      notification_settings: data.notification_settings,
      last_active: data.last_active,
      language: data.language,
      shabbat_mode: data.shabbat_mode
    };
  },
  
  /**
   * מחיקת משתמש
   */
  async delete(id: string) {
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
  },
  
  /**
   * חיפוש משתמשים לפי שם או אימייל
   */
  async search(query: string) {
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
  },
}; 