
import { NavigateFunction } from "react-router-dom";
import { logger } from "@/utils/logger";

/**
 * הסבר והתמודדות עם שגיאת PKCE או אי התאמת SSL
 * עם הוספת אפשרות הפניה אוטומטית לגרסת www
 */
export async function handlePkceError(
  navigate: NavigateFunction,
  setError: (error: string) => void,
  setLoading: (loading: boolean) => void
): Promise<void> {
  const log = logger.createLogger({ component: 'handlePkceError' });
  
  try {
    log.info("טיפול בשגיאת PKCE אפשרית או אי התאמת דומיין תעודת SSL");
    
    // קבלת מספר ניסיונות הפניה
    let redirectCount = parseInt(sessionStorage.getItem('auth_redirect_count') || '0');
    redirectCount++;
    sessionStorage.setItem('auth_redirect_count', redirectCount.toString());
    
    // בדיקת מספר ניסיונות - אם עברנו סף, נמנע לולאת הפניות
    if (redirectCount > 2) {
      log.warn("זוהתה לולאת הפניות אפשרית - מספר ניסיונות:", { redirectCount });
      setError("זוהתה לולאת הפניות אפשרית. מעביר לדף הבית...");
      setLoading(false);
      
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
      
      return;
    }
    
    // בדיקה אם אנחנו בדומיין הייצור
    const isProductionDomain = window.location.hostname === "kidushishi-menegment-app.co.il";
    const hasWWW = window.location.hostname.startsWith("www.");
    
    if (isProductionDomain && !hasWWW) {
      // הפניה לדומיין עם קידומת www
      log.info("מפנה משרת ללא www לשרת עם www לפתרון בעיית תעודת SSL");
      
      const newUrl = window.location.href.replace(
        "kidushishi-menegment-app.co.il",
        "www.kidushishi-menegment-app.co.il"
      );
      
      setError("התחברות נכשלה בגלל בעיית תעודת אבטחה. מפנה לכתובת מאובטחת...");
      setLoading(false);
      
      setTimeout(() => {
        window.location.href = newUrl;
      }, 1500);
      
      return;
    }
    
    // אחרת זו כנראה בעיית PKCE או בעיה אחרת
    log.warn("הניחוש הטוב ביותר הוא בעיית PKCE או תצורת אימות");
    setError("התחברות נכשלה - נראה שהיתה בעיה בתהליך האימות. אנא נסה להתחבר שוב.");
    setLoading(false);
    
    setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 2000);
  } catch (err) {
    log.error("שגיאה בטיפול בשגיאת PKCE:", err);
    setError("שגיאה בלתי צפויה בתהליך האימות");
    setLoading(false);
    
    setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 2000);
  }
}
