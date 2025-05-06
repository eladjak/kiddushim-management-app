
import { NavigateFunction } from 'react-router-dom';
import { logger } from '@/utils/logger';

/**
 * טיפול בשגיאות PKCE שונות ובעיות תעודות אבטחה
 */
export async function handlePkceError(
  navigate: NavigateFunction,
  setError: (error: string) => void,
  setLoading: (loading: boolean) => void
): Promise<void> {
  const log = logger.createLogger({ component: 'handlePkceError' });
  
  try {
    log.info("טיפול בשגיאת PKCE אפשרית או אי התאמת דומיין תעודת SSL");
    
    // בדיקה אם יש לנו בעיית אישורי SSL/דומיין
    const hostHasWWW = window.location.hostname.startsWith("www.");
    const isProduction = window.location.hostname.includes("kidushishi-menegment-app.co.il");
    
    // מקרה ראשון: שגיאת PKCE שקשורה לתווים מיוחדים
    if (window.location.hash && window.location.hash.includes('error=')) {
      log.warn("זוהה סימן לשגיאת אימות בפרגמנט URL");
      
      const params = new URLSearchParams(window.location.hash.substring(1));
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      
      if (error === 'invalid_request' && errorDescription?.includes('code_verifier')) {
        setError("שגיאת אימות: קוד PKCE לא תקף. כנראה שיש בעיה עם תווים עבריים. מנסה לטפל בבעיה.");
        log.warn("זוהתה שגיאת code_verifier - הגיוני שקשורה לתווים עבריים");
        
        // טיפול בשגיאה על ידי ניקוי נתוני אימות ישנים
        localStorage.removeItem('supabase-code-verifier');
        sessionStorage.removeItem('supabase-code-verifier');
        
        // הפניה מחדש לדף ההתחברות
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 2000);
        
        return;
      }
    }
    
    // מקרה שני: אי התאמה בתעודת SSL לדומיין
    if (isProduction && !hostHasWWW) {
      log.warn("זוהתה אפשרות לאי התאמה בתעודת SSL");
      setError("התחברות נכשלה בגלל בעיית תעודה. מפנה לדומיין עם www...");
      
      setTimeout(() => {
        // הפניה לדומיין עם www
        const redirectUrl = window.location.href.replace(
          "kidushishi-menegment-app.co.il",
          "www.kidushishi-menegment-app.co.il"
        );
        
        window.location.href = redirectUrl;
      }, 1500);
      
      return;
    }
    
    // מקרה שלישי: זיהוי לולאת הפניות אפשרית
    const redirectCount = parseInt(sessionStorage.getItem('auth_redirect_count') || '0');
    if (redirectCount > 2) {
      log.warn("זוהתה לולאת הפניות אפשרית", { redirectCount });
      setError("זוהתה לולאת הפניות. מפסיק ניסיונות לוגין אוטומטיים.");
      
      // ניקוי נתוני הפניה
      sessionStorage.removeItem('auth_redirect_count');
      
      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 2000);
      
      return;
    }
    
    // ניחוש מושכל למקור הבעיה
    log.warn("הניחוש הטוב ביותר הוא בעיית PKCE או תצורת אימות");
    
    // אם אין מידע מפורט יותר, נציג שגיאה כללית
    setError("ההתחברות נכשלה. נא לנסות שוב.");
    setLoading(false);
    
    setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 2000);
    
  } catch (err) {
    log.error("שגיאה כללית בטיפול בשגיאת PKCE:", { error: err });
    setError("שגיאה בלתי צפויה. נא לנסות שוב מאוחר יותר.");
    setLoading(false);
    
    setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 2000);
  }
}
