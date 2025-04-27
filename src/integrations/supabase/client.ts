
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// הגדר את כתובת וקוד ה-API של Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://uqumzjmyejlhoyliyesu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdW16am15ZWpsaG95bGl5ZXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwODA1MDIsImV4cCI6MjA1NDY1NjUwMn0.btzU9O72DPhxW_gm_G_AKPOaVBuKI8F4KSrnhdNmRO8";

/**
 * קביעת מפתח ייחודי לאחסון כדי למנוע התנגשויות
 */
const getStorageKey = () => {
  try {
    const hostname = window.location.hostname;
    // טיפול בדומיין עם ובלי www
    const normalizedHostname = hostname.replace(/^www\./, '');
    return `kidushishi-auth-token-${normalizedHostname}`;
  } catch (e) {
    // מנגנון גיבוי אם window לא זמין (SSR)
    return 'kidushishi-auth-token-default';
  }
};

// קבלת מפתח האחסון
const storageKey = getStorageKey();

/**
 * פונקציית עזר לזיהוי אם הדפדפן תומך בלוקל סטורג'
 */
const getStorageProvider = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      // בדיקה שהלוקל סטורג' עובד
      localStorage.setItem('supabase_test', 'test');
      localStorage.removeItem('supabase_test');
      return localStorage;
    }
  } catch (e) {
    console.warn("localStorage is not available, using in-memory storage");
  }

  // מנגנון גיבוי באחסון בזיכרון אם localStorage לא זמין
  const memoryStorage: Record<string, string> = {};
  return {
    getItem: (key: string) => memoryStorage[key] || null,
    setItem: (key: string, value: string) => { memoryStorage[key] = value },
    removeItem: (key: string) => { delete memoryStorage[key] }
  };
};

// יצירת מופע של לקוח supabase עבור כל האפליקציה
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,          // אפשר שמירת סשן
    autoRefreshToken: true,        // רענון אוטומטי של טוקנים
    detectSessionInUrl: true,      // זיהוי אוטומטי של access_token בכתובת
    storageKey: storageKey,        // מפתח אחסון עקבי
    storage: getStorageProvider(),  // השתמש בלוקל סטורג' או במנגנון גיבוי
    debug: import.meta.env.DEV,    // הפעל מצב דיבאג בסביבת פיתוח
    flowType: 'pkce',              // השתמש ב-PKCE עבור אימות OAuth
    // אין צורך ב-cookieOptions יותר
  },
  global: {
    headers: {
      'X-Client-Info': 'kidushishi-web-app'
    }
  }
});

// ייצוא פונקציה לקבלת מפתח האחסון עבור רכיבים אחרים
export const getAuthStorageKey = getStorageKey;

// ייצוא פונקצית נרמול דומיין לעזרה בבעיות הפניה
export const getNormalizedDomain = () => {
  try {
    const hostname = window.location.hostname;
    
    // דומיינים לוקליים או פיתוח לא צריכים קידומת www
    if (hostname.startsWith('local') || 
        hostname.includes('localhost') || 
        hostname.includes('lovableproject.com')) {
      return hostname;
    }
    
    // וודא שאנחנו משתמשים ב-www עבור דומיין הפרודקשן כדי להתאים לתעודת SSL
    if (hostname === 'kidushishi-menegment-app.co.il') {
      return 'www.kidushishi-menegment-app.co.il';
    }
    
    return hostname;
  } catch (e) {
    return '';
  }
};

/**
 * ניקוי אחסון ומידע של אימות
 */
export const clearAuthStorage = () => {
  try {
    // ניקוי פריטי localStorage הקשורים לאימות
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('supabase.auth.') || 
        key.includes(storageKey) ||
        key.includes('sb-') ||
        key.includes('_supabase_') ||
        key.includes('code_verifier')
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // ניקוי פריטי sessionStorage הקשורים לאימות
    const sessionKeysToRemove = [
      'auth_redirect_count',
      'auth_redirect_initiated',
      'auth_redirect_time',
      'auth_redirect_attempts',
      'supabase_access_token',
      'supabase_refresh_token',
      'supabase_pkce_verifier',
      'supabase_pkce_code',
      'supabase-code-verifier',
      'supabase-auth-token'
    ];
    
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    // ניקוי קוקיות Supabase אם קיימות
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('sb-') || cookie.includes('supabase')) {
        const name = cookie.split('=')[0];
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error clearing auth storage:", error);
    return false;
  }
};

/**
 * פונקציה להגדרת האימות לשימוש עם פרוטוקול אימות מתאים לפי הספק
 */
export const configureAuthProvider = (provider: string) => {
  // עבור גוגל אנחנו רוצים לתמוך גם ב-implicit flow
  if (provider === 'google') {
    // סמן שמדובר בתהליך אימות בהפניה
    sessionStorage.setItem('auth_redirect_initiated', 'true');
    sessionStorage.setItem('auth_redirect_time', Date.now().toString());
  }
};
