
import { NavigateFunction } from "react-router-dom";
import { clearAuthStorage } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * טיפול בשגיאות PKCE או אי-התאמת דומיין לתעודה
 */
export async function handlePkceError(
  navigate: NavigateFunction,
  setError: (error: string) => void,
  setLoading: (loading: boolean) => void
): Promise<void> {
  const log = logger.createLogger({ component: 'handlePkceError' });
  log.info("Handling potential PKCE error or SSL certificate domain mismatch");
  
  // בדיקה אם אנחנו תקועים בלולאת הפניה
  const redirectCount = parseInt(localStorage.getItem('auth_redirect_count') || '0');
  if (redirectCount > 2) {
    log.error("Detected redirect loop, breaking the cycle");
    localStorage.removeItem('auth_redirect_count');
    setError("זוהתה לולאת הפניות. הקשר לתמיכה הטכנית אם הבעיה נמשכת.");
    setLoading(false);
    
    // מעביר את המשתמש לדף הבית במקום להישאר בלופ
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 2000);
    
    return;
  }
  
  // נקה נתוני אימות
  clearAuthStorage();
  
  // בדיקה אם הופנינו מ-www.domain ל-domain או להיפך
  const hostname = window.location.hostname;
  const isNonWwwDomain = hostname === 'kidushishi-menegment-app.co.il';
  
  if (isNonWwwDomain) {
    log.info("Detected non-www domain that may cause SSL issues", { hostname });
    
    setError("ההתחברות נכשלה בגלל בעיית תעודת SSL - התעודה תקפה עבור www.kidushishi-menegment-app.co.il בלבד. מועבר אוטומטית לכתובת הנכונה...");
    
    // שמירת מספר ההפניות ב-localStorage
    localStorage.setItem('auth_redirect_count', (redirectCount + 1).toString());
    
    // זמן למשתמש לראות את ההודעה לפני הפניה מחדש
    setTimeout(() => {
      const protocol = window.location.protocol;
      const pathname = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      
      window.location.href = `${protocol}//www.kidushishi-menegment-app.co.il${pathname}${search}${hash}`;
    }, 1500);
    
    return;
  }

  // נסיון אחרון - מחיקת כל נתוני האימות ומעבר לדף הבית
  try {
    // ניקוי מושלם של נתוני אימות
    clearAuthStorage();
    
    // הגדרת הודעת שגיאה
    setError("התחברות נכשלה - נראה שהיתה בעיה בתהליך האימות. אנא נסה להתחבר שוב.");
    setLoading(false);
    
    // ניווט הביתה אחרי השהיה
    setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 2000);
  } catch (signOutError) {
    log.error("Error cleaning up auth state:", { error: signOutError });
    setError("התחברות נכשלה - קרתה בעיה באימות. אנא נסה שוב.");
    setLoading(false);
    
    // ניווט לדף ההתחברות גם אם ניקוי נכשל
    setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 2000);
  }
}
