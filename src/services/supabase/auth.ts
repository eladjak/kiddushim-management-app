
import { supabase } from './client';
import type { Session, User, SignUpWithPasswordCredentials, AuthError } from '@supabase/supabase-js';

// טיפוסים עבור שירותי אימות
export interface AuthCredentials {
  email: string;
  password: string;
  options?: {
    data?: Record<string, unknown>;
    emailRedirectTo?: string;
  };
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  password: string;
}

// טיפוס לאירועי שינוי במצב האימות
export type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'PASSWORD_RECOVERY' | 'TOKEN_REFRESHED';

/**
 * שירותי אימות לעבודה עם Supabase
 */
export const authService = {
  /**
   * התחברות עם אימייל וסיסמה
   */
  async signIn({ email, password, options }: AuthCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      // הסרת עטיפת options שגרמה לשגיאת טיפוס
    });

    if (error) throw error;
    return data;
  },

  /**
   * יצירת משתמש חדש
   */
  async signUp({ email, password, options }: AuthCredentials) {
    const signUpData: SignUpWithPasswordCredentials = {
      email,
      password,
      options
    };
    
    const { data, error } = await supabase.auth.signUp(signUpData);

    if (error) throw error;
    return data;
  },

  /**
   * התנתקות מהמערכת
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  /**
   * קבלת משתמש נוכחי (אם מחובר)
   */
  getCurrentUser(): Promise<User | null> {
    return supabase.auth.getUser().then(({ data, error }) => {
      if (error) throw error;
      return data?.user || null;
    });
  },

  /**
   * קבלת סשן נוכחי (אם קיים)
   */
  getCurrentSession(): Promise<Session | null> {
    return supabase.auth.getSession().then(({ data, error }) => {
      if (error) throw error;
      return data?.session || null;
    });
  },

  /**
   * שליחת אימייל לאיפוס סיסמה
   */
  async resetPassword({ email }: ResetPasswordRequest) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    return data;
  },

  /**
   * עדכון סיסמה
   */
  async updatePassword({ password }: UpdatePasswordRequest) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * הגדרת מאזין לשינויים באימות
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return () => {
      data.subscription.unsubscribe();
    };
  },

  /**
   * עדכון מידע על המשתמש
   */
  async updateUserMetadata(metadata: Record<string, unknown>) {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });

    if (error) throw error;
    return data;
  },
}; 
