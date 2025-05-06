
/**
 * כלי עזר לטיפול בקידוד ופענוח מחרוזות עם תמיכה בתווים עבריים וסימנים מיוחדים
 */

/**
 * קידוד בטוח של מחרוזות עם תמיכה בתווי UTF-8 ועברית
 * פתרון לבעיית btoa שמתקשה עם תווים מחוץ לטווח Latin1
 */
export function safeEncode(str: string): string {
  try {
    // נסה קודם בדרך הרגילה
    return btoa(str);
  } catch (err) {
    // אם נכשל (כנראה בגלל תווי UTF-8), נשתמש בפתרון מותאם
    return btoa(encodeURIComponent(str));
  }
}

/**
 * פענוח בטוח של מחרוזות מקודדות עם תמיכה בתווי UTF-8 ועברית
 */
export function safeDecode(str: string): string {
  try {
    // נסה קודם בדרך הרגילה
    return atob(str);
  } catch (err) {
    try {
      // אם נכשל, ננסה לפענח בהנחה שקודד עם הפונקציה המותאמת שלנו
      return decodeURIComponent(atob(str));
    } catch (innerErr) {
      console.error("שגיאה בפענוח מחרוזת:", innerErr);
      return str; // החזר את המחרוזת המקורית במקרה של כשלון
    }
  }
}

/**
 * יצירת מחרוזת אקראית בטוחה לשימוש ב-PKCE עם תמיכה בעברית
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
    
    return result;
  } catch (e) {
    // גיבוי למקרה של שגיאה
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return result;
  }
}
