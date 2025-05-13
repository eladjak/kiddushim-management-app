
/**
 * כלים לקידוד ופענוח בטוחים שתומכים בעברית
 */

/**
 * יצירת מחרוזת קוד אימות PKCE בטוחה שתומך בתווים עבריים
 * הפונקציה מייצרת מחרוזת אקראית ללא תווים שעלולים לגרום לבעיות
 */
export function generateSafePKCEString(length: number = 64): string {
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
    
    // החזרת הערך הראשון שלא ריק
    return fromLocalStorage || 
           fromLocalStorageBackup || 
           fromLocalStoragePKCE ||
           fromSessionStorage ||
           fromSessionStoragePKCE;
  } catch (error) {
    console.error('Error retrieving code verifier:', error);
    return null;
  }
}
