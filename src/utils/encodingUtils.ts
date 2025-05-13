
/**
 * כלי עזר לטיפול בקידוד ופענוח מחרוזות עם תמיכה בתווים עבריים וסימנים מיוחדים
 */

/**
 * קידוד בטוח של מחרוזות עם תמיכה בתווי UTF-8 ועברית
 * פתרון לבעיית btoa שמתקשה עם תווים מחוץ לטווח Latin1
 */
export function safeEncode(str: string): string {
  try {
    // המרת המחרוזת ל-UTF-8 לפני קידוד בשיטת base64
    return window.btoa(unescape(encodeURIComponent(str)));
  } catch (err) {
    console.error("שגיאה בקידוד מחרוזת:", err);
    
    // נסיון אחרון - מסנן תווים לא חוקיים
    const latinOnly = str.replace(/[^\x00-\xFF]/g, '');
    try {
      return window.btoa(latinOnly);
    } catch (innerErr) {
      console.error("שגיאה בקידוד אחרי סינון:", innerErr);
      
      // נייצר סטרינג רנדומלי במקרה של שגיאה מוחלטת
      const fallback = Array.from({ length: 32 }, () => 
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[
          Math.floor(Math.random() * 62)
        ]
      ).join("");
      return window.btoa(fallback);
    }
  }
}

/**
 * פענוח בטוח של מחרוזות מקודדות עם תמיכה בתווי UTF-8 ועברית
 */
export function safeDecode(str: string): string {
  try {
    // פענוח מ-base64 והמרה חזרה ל-UTF-8
    return decodeURIComponent(escape(window.atob(str)));
  } catch (err) {
    try {
      // אם הפענוח נכשל, ננסה פענוח רגיל
      return window.atob(str);
    } catch (innerErr) {
      console.error("שגיאה בפענוח מחרוזת:", innerErr);
      return str; // החזר את המחרוזת המקורית במקרה של כשלון
    }
  }
}

/**
 * יצירת מחרוזת אקראית בטוחה לשימוש ב-PKCE ללא תלות בתווי עברית
 * @param length אורך המחרוזת הרצוי
 */
export function generateSafePKCEString(length: number): string {
  // רק תווים אלפאנומריים בטוחים לשימוש ב-URL
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  
  try {
    // שימוש בערכים אקראיים קריפטוגרפיים בטוחים
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
  } catch (e) {
    // גיבוי למקרה של שגיאה עם ג'נרטור רגיל
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  }
  
  return result;
}

/**
 * שמירה בטוחה של מפתח ה-code verifier במספר מקומות לגיבוי
 */
export function storeCodeVerifier(codeVerifier: string): void {
  try {
    const timestamp = Date.now().toString();
    
    // שמירה בכל המקומות האפשריים לגיבוי
    localStorage.setItem('supabase-code-verifier', codeVerifier);
    localStorage.setItem('code-verifier-timestamp', timestamp);
    localStorage.setItem('code-verifier-backup', codeVerifier);
    
    // שמירה גם ב-sessionStorage כגיבוי נוסף
    sessionStorage.setItem('supabase-code-verifier', codeVerifier);
    sessionStorage.setItem('code-verifier-timestamp', timestamp);
    
    // לוג הצלחה
    console.log(`נשמר code verifier באורך ${codeVerifier.length} בכל אמצעי האחסון`);
  } catch (e) {
    console.error("שגיאה בשמירת מפתח code verifier:", e);
  }
}

/**
 * שחזור של מפתח ה-code verifier מכל מקומות האחסון האפשריים
 */
export function retrieveCodeVerifier(): string | null {
  try {
    // נסה לשחזר מכל המקורות האפשריים
    const localStorageVerifier = localStorage.getItem('supabase-code-verifier');
    const sessionStorageVerifier = sessionStorage.getItem('supabase-code-verifier');
    const backupVerifier = localStorage.getItem('code-verifier-backup');
    
    // החזר את הראשון שנמצא
    return localStorageVerifier || sessionStorageVerifier || backupVerifier;
  } catch (e) {
    console.error("שגיאה בשחזור מפתח code verifier:", e);
    return null;
  }
}

/**
 * מנקה את כל מקומות האחסון של מפתח ה-code verifier
 */
export function clearCodeVerifier(): void {
  try {
    localStorage.removeItem('supabase-code-verifier');
    localStorage.removeItem('code-verifier-timestamp');
    localStorage.removeItem('code-verifier-backup');
    sessionStorage.removeItem('supabase-code-verifier');
    sessionStorage.removeItem('code-verifier-timestamp');
    console.log("נוקו כל מפתחות ה-code verifier");
  } catch (e) {
    console.error("שגיאה בניקוי מפתחות code verifier:", e);
  }
}
