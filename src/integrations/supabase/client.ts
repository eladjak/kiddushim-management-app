
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// יצירת לקוח סופהבייס עם הגדרות משופרות לתמיכה בעברית ואמינות
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage, 
    storageKey: 'sb-uqumzjmyejlhoyliyesu-auth-token',
    debug: true, // אפשרות דיבוג מורחבת לאיתור בעיות
  },
});

/**
 * מקבל מפתח לאחסון מידע בלוקל סטורג'
 */
export function getAuthStorageKey() {
  // השתמש במפתח קבוע ומוגדר כדי לוודא עקביות
  return 'sb-uqumzjmyejlhoyliyesu-auth-token';
}

/**
 * ניקוי כל האחסון הקשור לאימות
 */
export function clearAuthStorage() {
  try {
    // ניקוי כל פריטי localStorage הקשורים לאימות
    localStorage.removeItem('supabase-code-verifier');
    localStorage.removeItem('code-verifier-timestamp');
    localStorage.removeItem('auth_redirect_initiated');
    localStorage.removeItem('auth_redirect_time');
    localStorage.removeItem('auth_redirect_count');
    localStorage.removeItem('auth_provider');
    localStorage.removeItem('code-verifier-backup');
    localStorage.removeItem('pkce_code_verifier');
    
    // ניקוי כל פריטי sessionStorage הקשורים לאימות
    sessionStorage.removeItem('supabase-code-verifier');
    sessionStorage.removeItem('auth_redirect_initiated');
    sessionStorage.removeItem('auth_redirect_time');
    sessionStorage.removeItem('auth_redirect_count');
    sessionStorage.removeItem('auth_provider');
    sessionStorage.removeItem('pkce_code_verifier');

    // ניקוי אחסון סופהבייס - שימוש ב-signOut במקום
    supabase.auth.signOut({ scope: 'local' })
      .then(() => console.log('Supabase auth state cleared'))
      .catch(err => console.error('Error clearing Supabase auth state:', err));
    
    console.log('All auth storage cleared');
  } catch (err) {
    console.error('Error clearing auth storage:', err);
  }
}

/**
 * קבלת שם דומיין עם קידומת www אם נדרש
 */
export function getNormalizedDomain() {
  const hostname = window.location.hostname;
  
  // אם אנחנו ב-localhost או כבר ב-www, השתמש בhostname הנוכחי
  if (hostname === 'localhost' || hostname.startsWith('www.')) {
    return hostname;
  }
  
  // הוסף קידומת www לדומיין הפרודקשן כדי להתאים לתעודת SSL
  if (hostname === 'kidushishi-menegment-app.co.il') {
    return 'www.kidushishi-menegment-app.co.il';
  }
  
  // ברירת מחדל ל-hostname הנוכחי אם לא תואם דפוסים ידועים
  return hostname;
}

/**
 * קביעת הגדרות לספק אימות
 */
export function configureAuthProvider(provider: string) {
  // הגדר הגדרות ספציפיות לספק כאן אם יידרש בעתיד
  console.log(`Configuring auth provider: ${provider}`);
}

/**
 * הוסף מידע חשוב לדיאגנוסטיקה של בעיות אימות
 */
export function logAuthDiagnostics() {
  try {
    const diagnosticInfo = {
      hostname: window.location.hostname,
      href: window.location.href,
      protocol: window.location.protocol,
      supabaseUrl: supabaseUrl,
      localStorage: {
        hasCodeVerifier: !!localStorage.getItem('supabase-code-verifier'),
        codeVerifierTimestamp: localStorage.getItem('code-verifier-timestamp'),
        authRedirectInitiated: localStorage.getItem('auth_redirect_initiated'),
        authRedirectTime: localStorage.getItem('auth_redirect_time'),
        hasCodeVerifierBackup: !!localStorage.getItem('code-verifier-backup'),
        hasPkceVerifier: !!localStorage.getItem('pkce_code_verifier')
      },
      sessionStorage: {
        hasCodeVerifier: !!sessionStorage.getItem('supabase-code-verifier'),
        hasPkceVerifier: !!sessionStorage.getItem('pkce_code_verifier')
      },
      redirectUrlWillBe: `${window.location.protocol}//${getNormalizedDomain()}${window.location.port ? `:${window.location.port}` : ''}/auth/callback`
    };
    
    console.log('Auth diagnostics:', diagnosticInfo);
    return diagnosticInfo;
  } catch (err) {
    console.error('Error generating auth diagnostics:', err);
    return null;
  }
}
