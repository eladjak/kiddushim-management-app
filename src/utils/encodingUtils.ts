
import { logger } from './logger';
const log = logger.createLogger({ component: 'encodingUtils' });

/**
 * Creates a base64 string that is URL safe and Hebrew-compatible
 * This is a safer implementation for PKCE that handles Hebrew and special characters
 */
export function generateSafePKCEString(length: number): string {
  try {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const charactersLength = characters.length;
    let result = '';

    // Use crypto.getRandomValues if available for better randomness
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      result += characters.charAt(randomValues[i] % charactersLength);
    }

    return result;
  } catch (error) {
    log.error('Error generating safe PKCE string:', error);
    
    // Fallback to simpler implementation if crypto fails
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  }
}

/**
 * Safely store the code verifier in all available storage mechanisms
 * for redundancy in case one fails
 */
export function storeCodeVerifier(codeVerifier: string): void {
  try {
    localStorage.setItem('pkce_code_verifier', codeVerifier);
    log.info('Stored code verifier in localStorage');
  } catch (e) {
    log.error('Failed to store code verifier in localStorage:', e);
  }
  
  try {
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    log.info('Stored code verifier in sessionStorage');
  } catch (e) {
    log.error('Failed to store code verifier in sessionStorage:', e);
  }
}

/**
 * Safely retrieves the code verifier from any available storage mechanism
 * Tries multiple storage options for redundancy
 */
export function retrieveCodeVerifier(): string | null {
  try {
    // נסיון ראשון מ-localStorage
    const localVerifier = localStorage.getItem('pkce_code_verifier');
    if (localVerifier) {
      log.info('Retrieved code verifier from localStorage');
      return localVerifier;
    }
    
    // נסיון שני מ-sessionStorage
    const sessionVerifier = sessionStorage.getItem('pkce_code_verifier');
    if (sessionVerifier) {
      log.info('Retrieved code verifier from sessionStorage');
      return sessionVerifier;
    }
    
    // בדיקה חלופית עם שמות קודמים שהיו בשימוש
    const legacyVerifier = localStorage.getItem('code_verifier') || 
                          sessionStorage.getItem('code_verifier') ||
                          localStorage.getItem('code-verifier') || 
                          sessionStorage.getItem('code-verifier');
    
    if (legacyVerifier) {
      log.info('Retrieved code verifier from legacy storage key');
      return legacyVerifier;
    }
    
    log.warn('No code verifier found in any storage');
    return null;
  } catch (e) {
    log.error('Error retrieving code verifier:', e);
    return null;
  }
}

/**
 * בטוחה לקידוד מחרוזות בינאריות ל-Base64
 * עם תמיכה בתווי עברית וUnicode
 */
export function safeEncode(str: string): string {
  try {
    // בדיקה אם המחרוזת ריקה
    if (!str) return '';
    
    // שימוש ב-TextEncoder ליצירת מערך בינארי מה-UTF-8
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    
    // המרה ל-base64 תוך שימוש באובייקט Buffer אם קיים בסביבה, או באמצעים אחרים
    const base64 = btoa(
      Array.from(data)
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    
    return base64;
  } catch (error) {
    log.error('Error encoding string to base64:', error);
    
    // גישת גיבוי שעושה שימוש ב-encodeURIComponent
    try {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    } catch (backupError) {
      log.error('Backup encoding failed:', backupError);
      return encodeURIComponent(str);
    }
  }
}

/**
 * פענוח בטוח של מחרוזות מ-Base64 לתווים
 * עם תמיכה בתווי עברית וUnicode
 */
export function safeDecode(base64: string): string {
  try {
    // בדיקה אם המחרוזת ריקה
    if (!base64) return '';
    
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // המרה חזרה למחרוזת UTF-8
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch (error) {
    log.error('Error decoding string from base64:', error);
    
    // גישת גיבוי
    try {
      return decodeURIComponent(
        Array.prototype.map
          .call(atob(base64), (c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
    } catch (backupError) {
      log.error('Backup decoding failed:', backupError);
      return base64;
    }
  }
}

