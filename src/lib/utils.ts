
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * מטפל במחרוזות עבריות לשימוש בטוח ב-API 
 */
export function sanitizeHebrew(str: string): string {
  if (!str) return str;
  
  try {
    // בדיקה אם המחרוזת מכילה תווים עבריים
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 255) {
        // אם יש תווים עבריים, נקודד את המחרוזת
        return encodeURIComponent(str);
      }
    }
    
    // אם אין תווים עבריים, נחזיר את המחרוזת כמו שהיא
    return str;
  } catch (e) {
    console.error('שגיאה בטיפול במחרוזת עברית:', e);
    return str;
  }
}

/**
 * מעבד אובייקט לשימוש בטוח ב-API עם תווים עבריים
 */
export function sanitizeObjectForAPI(obj: any): any {
  if (!obj) return obj;
  
  // אם זה מחרוזת, נטפל בה ישירות
  if (typeof obj === 'string') {
    return sanitizeHebrew(obj);
  }
  
  // אם זה מערך, נעבד כל פריט בנפרד
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObjectForAPI(item));
  }
  
  // אם זה אובייקט, נעבד כל שדה בנפרד
  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, any> = {};
    Object.keys(obj).forEach(key => {
      result[key] = sanitizeObjectForAPI(obj[key]);
    });
    return result;
  }
  
  // ערכים אחרים (מספרים, בוליאנים וכו') נחזיר כפי שהם
  return obj;
}

/**
 * ממיר אובייקט לפורמט URL בטוח (query params)
 */
export function objectToUrlParams(obj: Record<string, any>): string {
  const sanitizedObj = sanitizeObjectForAPI(obj);
  const params = new URLSearchParams();
  
  Object.entries(sanitizedObj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object') {
        params.append(key, JSON.stringify(value));
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  return params.toString();
}

/**
 * פונקציה המוודאת תווים חוקיים לשמות קבצים
 */
export function sanitizeFilename(filename: string): string {
  // החלף תווים לא חוקיים בתו תחתון
  return filename.replace(/[/\\?%*:|"<>]/g, '_');
}
