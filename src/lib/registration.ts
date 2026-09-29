/**
 * עזרי הרשמה ציבורית (דף הנחיתה).
 * מפריד לוגיקה טהורה מהרכיב כדי שאפשר יהיה לבדוק אותה.
 */

/** אותו כלל בדיוק כמו ב-supabase/functions/secure-registration (אחרי הסרת מקפים ורווחים). */
const PHONE_REGEX = /^0[5-9]\d{8}$|^\+972[5-9]\d{8}$/;

export const isValidRegistrationPhone = (raw: string): boolean =>
  PHONE_REGEX.test(raw.replace(/[-\s]/g, ""));

export const parseFamilySize = (raw: string): number => {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 20);
};

export interface RegistrationInput {
  name: string;
  phone: string;
  consent: boolean;
}

/** מחזיר הודעת שגיאה בעברית, או null אם הקלט תקין. */
export const validateRegistration = (input: RegistrationInput): string | null => {
  if (input.name.trim().length < 2) return "נא להזין שם מלא";
  if (!isValidRegistrationPhone(input.phone)) {
    return "נא להזין מספר טלפון נייד תקין, למשל 050-1234567";
  }
  if (!input.consent) return "יש לאשר את מדיניות הפרטיות כדי להירשם";
  return null;
};

export const GENERIC_REGISTRATION_ERROR = "אירעה שגיאה בהרשמה. נסה שוב או צור קשר";

/**
 * שגיאת supabase.functions.invoke על סטטוס לא-2xx מכילה את ה-Response ב-context.
 * מנסה להוציא ממנו את הודעת השרת בעברית (למשל "כבר נרשמת לאירוע זה"), אחרת הודעה כללית.
 */
export const extractRegistrationError = async (err: unknown): Promise<string> => {
  const ctx = (err as { context?: unknown } | null)?.context;
  if (ctx && typeof (ctx as Response).json === "function") {
    try {
      const body = (await (ctx as Response).clone().json()) as { error?: unknown };
      if (typeof body?.error === "string" && body.error.trim()) return body.error;
    } catch {
      /* גוף לא-JSON - נופלים להודעה כללית */
    }
  }
  if (err instanceof Error && /[֐-׿]/.test(err.message)) return err.message;
  return GENERIC_REGISTRATION_ERROR;
};
