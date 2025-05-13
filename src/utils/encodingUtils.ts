
/**
 * כלים לקידוד ופענוח בטוחים שתומכים בעברית
 */

/**
 * יצירת מחרוזת קוד אימות PKCE בטוחה שתומך בתווים עבריים
 * הפונקציה מייצרת מחרוזת אקראית ללא תווים שעלולים לגרום לבעיות
 */
export function generateSafePKCEString(length: number = 128): string {
  // ספציפית משתמשים רק בתווים Latin1 כדי למנוע את שגיאת btoa
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  
  let result = '';
  for (let i = 0; i < array.length; i++) {
    result += validChars.charAt(array[i] % validChars.length);
  }
  
  return result;
}

/**
 * קידוד מחרוזת לפורמט שמתאים לשימוש ב-URL
 * משתמש בקידוד קנוני שעובד עם עברית
 */
export function safeEncode(str: string): string {
  // קודם נמיר את המחרוזת ל-UTF-8 ואז נקודד
  try {
    return encodeURIComponent(str);
  } catch (e) {
    console.error('שגיאה בקידוד מחרוזת:', e);
    // החזרת גרסה בטוחה אם יש שגיאה
    return encodeURIComponent(
      str.replace(/[^\x00-\x7F]/g, char => {
        try {
          return encodeURIComponent(char);
        } catch {
          return '_';
        }
      })
    );
  }
}

/**
 * פענוח מחרוזת מקודדת חזרה למחרוזת רגילה
 * משמש לפענוח תווים עבריים שהגיעו ב-URL
 */
export function safeDecode(encoded: string): string {
  try {
    return decodeURIComponent(encoded);
  } catch (e) {
    console.error('שגיאה בפענוח מחרוזת:', e);
    // ניסיון להחזיר מה שאפשר
    return encoded;
  }
}

/**
 * בדיקה האם מחרוזת מכילה תווים שמחוץ לטווח Latin1
 */
export function containsNonLatin1Chars(str: string): boolean {
  if (!str) return false;
  
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      return true;
    }
  }
  
  return false;
}

/**
 * טיפול במחרוזות שעלולות להכיל תווים עבריים
 * הפונקציה מוודאת שמחרוזות עם תווים עבריים מטופלות כראוי
 */
export function sanitizeHebrewString(str: string): string {
  if (!str || !containsNonLatin1Chars(str)) {
    return str;
  }
  
  // אם יש תווים עבריים, נקודד את המחרוזת
  try {
    return safeEncode(str);
  } catch (e) {
    console.error('שגיאה בטיפול במחרוזת עברית:', e);
    return str;
  }
}

/**
 * שמירת מפתח אימות PKCE במספר מקומות שונים להגברת השרידות
 */
export function storeCodeVerifier(codeVerifier: string): void {
  try {
    // שמירה בלוקל סטורג׳
    localStorage.setItem('supabase-code-verifier', codeVerifier);
    localStorage.setItem('code-verifier-timestamp', new Date().toISOString());
    localStorage.setItem('code-verifier-backup', codeVerifier);
    
    // גם בסשן סטורג׳ למקרה שלוקל סטורג׳ לא זמין
    sessionStorage.setItem('supabase-code-verifier', codeVerifier);
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    
    // שמירת ערכי אימות נוספים שמוסיפים שרידות
    try {
      localStorage.setItem('sb_cv', codeVerifier);
      sessionStorage.setItem('sb_cv', codeVerifier);
    } catch (e) {
      console.error('שגיאה בשמירת ערכי אימות נוספים:', e);
    }
    
    console.log('Code verifier stored successfully in multiple locations');
  } catch (error) {
    console.error('Error storing code verifier:', error);
  }
}

/**
 * אחזור מפתח אימות PKCE מכל מקום אפשרי
 * בודק מספר מקומות אחסון שונים
 */
export function retrieveCodeVerifier(): string | null {
  try {
    // בדיקת כל המקומות האפשריים שבהם ה-code verifier עשוי להימצא
    const fromLocalStorage = localStorage.getItem('supabase-code-verifier');
    const fromLocalStorageBackup = localStorage.getItem('code-verifier-backup');
    const fromLocalStoragePKCE = localStorage.getItem('pkce_code_verifier');
    const fromSessionStorage = sessionStorage.getItem('supabase-code-verifier');
    const fromSessionStoragePKCE = sessionStorage.getItem('pkce_code_verifier');
    const fromLocalStorageSB = localStorage.getItem('sb_cv');
    const fromSessionStorageSB = sessionStorage.getItem('sb_cv');
    
    // החזרת הערך הראשון שלא ריק
    return fromLocalStorage || 
           fromLocalStorageBackup || 
           fromLocalStoragePKCE ||
           fromSessionStorage ||
           fromSessionStoragePKCE ||
           fromLocalStorageSB ||
           fromSessionStorageSB;
  } catch (error) {
    console.error('Error retrieving code verifier:', error);
    return null;
  }
}

/**
 * עיבוד אובייקט לקידוד בטוח למקרה שיש בו תווים עבריים 
 * הפונקציה עוברת על כל השדות באובייקט באופן רקורסיבי
 */
export function sanitizeObjectForApi(obj: any): any {
  if (!obj) return obj;
  
  // אם זה מחרוזת, נטפל בה ישירות
  if (typeof obj === 'string') {
    return sanitizeHebrewString(obj);
  }
  
  // אם זה מערך, נעבד כל פריט בנפרד
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObjectForApi(item));
  }
  
  // אם זה אובייקט, נעבד כל שדה בנפרד
  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = sanitizeObjectForApi(obj[key]);
      }
    }
    return result;
  }
  
  // ערכים אחרים (מספרים, בוליאנים וכו') נחזיר כפי שהם
  return obj;
}
