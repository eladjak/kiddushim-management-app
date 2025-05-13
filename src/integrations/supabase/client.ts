
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// פונקצית היעוט לבדיקה האם מחרוזת מכילה תווים מחוץ לטווח ה-Latin1
function containsNonLatin1(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      return true;
    }
  }
  return false;
}

// פונקציה לעיבוד בטוח של מחרוזות עם תווים עבריים
function safeEncodeString(str: string): string {
  if (!str || typeof str !== 'string') return str;
  
  // אם המחרוזת לא מכילה תווים עבריים, נחזיר אותה כמו שהיא
  if (!containsNonLatin1(str)) return str;
  
  // אחרת נשתמש בקידוד בטוח
  try {
    return encodeURIComponent(str);
  } catch (e) {
    console.error('שגיאה בקידוד מחרוזת:', e);
    return str;
  }
}

// פונקציה לעיבוד בטוח של אובייקטים שעשויים להכיל תווים עבריים
function sanitizeForApi(data: any): any {
  if (!data) return data;
  
  if (typeof data === 'string') {
    return safeEncodeString(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForApi(item));
  }
  
  if (typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = sanitizeForApi(data[key]);
      }
    }
    return result;
  }
  
  return data;
}

/**
 * יצירת פונקצית fetch מותאמת עם תמיכה משופרת בעברית
 * מתמודדת עם שגיאת btoa שנגרמת מתווים עבריים
 */
function customFetch(url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
  // העתקת האופציות כדי למנוע שינוי במקור
  const safeOptions = options ? { ...options } : {};
  
  // בדיקה האם יש גוף לבקשה והאם הוא מחרוזת
  if (safeOptions.body && typeof safeOptions.body === 'string') {
    try {
      // ניסיון לפרסר את הגוף כ-JSON
      const bodyObj = JSON.parse(safeOptions.body);
      
      // טיפול בתווים עבריים וקידוד בטוח
      const sanitizedBody = sanitizeForApi(bodyObj);
      
      // החלפת הגוף המקורי בגוף המטופל
      safeOptions.body = JSON.stringify(sanitizedBody);
      
    } catch (e) {
      console.warn('שגיאה בטיפול בגוף הבקשה:', e);
      // אם יש בעיה בפרסור, נשאיר את הגוף כפי שהוא
    }
  }
  
  // התאמת Headers במידת הצורך
  if (safeOptions.headers) {
    safeOptions.headers = {
      ...safeOptions.headers,
      'Content-Type': 'application/json; charset=utf-8',
    };
  }

  // ביצוע הקריאה עם האופציות המותאמות
  return fetch(url, safeOptions);
}

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
  global: {
    fetch: customFetch
  }
});

/**
 * הגדרת ספק האימות לתהליך ההתחברות
 * @param provider שם ספק האימות ('google', 'facebook', etc.)
 */
export function configureAuthProvider(provider: string) {
  // אין צורך בהגדרות נוספות כרגע, אך הפונקציה נדרשת על ידי GoogleAuthButton
  console.log(`Configuring auth provider: ${provider}`);
  // בעתיד ניתן להוסיף כאן הגדרות ספציפיות לספקי אימות שונים
}

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
    localStorage.removeItem('sb_cv');
    
    // ניקוי כל פריטי sessionStorage הקשורים לאימות
    sessionStorage.removeItem('supabase-code-verifier');
    sessionStorage.removeItem('auth_redirect_initiated');
    sessionStorage.removeItem('auth_redirect_time');
    sessionStorage.removeItem('auth_redirect_count');
    sessionStorage.removeItem('auth_provider');
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('sb_cv');

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

/**
 * בדיקה וטיפול בטריגר ליצירת פרופיל
 */
export async function checkAndHandleProfileCreation(userId: string) {
  if (!userId) return null;
  
  try {
    console.log('Checking if profile exists for user:', userId);
    
    // בדיקה אם קיים פרופיל
    const { data: existingProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking profile:', error);
      return null;
    }
    
    // אם קיים פרופיל, החזר אותו
    if (existingProfile) {
      console.log('Profile exists:', existingProfile.id);
      return existingProfile;
    }
    
    // אם אין פרופיל, נסה לקבל פרטי משתמש
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      console.error('No user data available for profile creation');
      return null;
    }
    
    const user = userData.user;
    
    // הכנת פרטי הפרופיל
    const name = user.user_metadata?.name || 
                user.user_metadata?.full_name || 
                user.email?.split('@')[0] || 'משתמש';
    
    const avatarUrl = user.user_metadata?.avatar_url || 
                      user.user_metadata?.picture || 
                      null;
                      
    // יצירת פרופיל חדש
    const { data, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name,
        email: user.email,
        avatar_url: avatarUrl,
        role: 'coordinator',
        language: 'he',
        settings: {},
        notification_settings: {},
        shabbat_mode: false,
        encoding_support: true
      })
      .select()
      .single();
      
    if (insertError) {
      console.error('Failed to create profile:', insertError);
      return null;
    }
    
    console.log('Profile created successfully:', data);
    return data;
  } catch (err) {
    console.error('Error in checkAndHandleProfileCreation:', err);
    return null;
  }
}
