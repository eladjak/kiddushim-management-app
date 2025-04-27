
import { NavigateFunction } from "react-router-dom";
import { supabase, clearAuthStorage } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { extractAccessToken } from "./extractAccessToken";

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
  const redirectCount = parseInt(sessionStorage.getItem('auth_redirect_count') || '0');
  if (redirectCount > 2) {
    log.error("Detected redirect loop, breaking the cycle");
    sessionStorage.removeItem('auth_redirect_count');
    setError("זוהתה לולאת הפניות. הקשר לתמיכה הטכנית אם הבעיה נמשכת.");
    setLoading(false);
    
    // מעביר את המשתמש לדף הבית במקום להישאר בלופ
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 2000);
    
    return;
  }
  
  // נקה שדות פקודת אימות ומאמת
  sessionStorage.removeItem('supabase-code-verifier');
  sessionStorage.removeItem('supabase-auth-token');
  sessionStorage.removeItem('auth_redirect_attempts');
  
  // בדיקה אם הופנינו מ-www.domain ל-domain או להיפך
  const hostname = window.location.hostname;
  const isNonWwwDomain = hostname === 'kidushishi-menegment-app.co.il';
  
  if (isNonWwwDomain) {
    log.info("Detected non-www domain that may cause SSL issues", { hostname });
    
    setError("ההתחברות נכשלה בגלל בעיית תעודת SSL - התעודה תקפה עבור www.kidushishi-menegment-app.co.il בלבד. מועבר אוטומטית לכתובת הנכונה...");
    
    // שמירת מספר ההפניות ב-sessionStorage
    sessionStorage.setItem('auth_redirect_count', (redirectCount + 1).toString());
    
    // זמן למשתמש לראות את ההודעה לפני הפניה מחדש
    setTimeout(() => {
      const protocol = window.location.protocol;
      const pathname = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      
      window.location.href = `${protocol}//www.kidushishi-menegment-app.co.il${pathname}${search}${hash}`;
    }, 1000);
    
    return;
  }
  
  // בדיקה אם יש פרמטרי access_token בפרגמנט
  if (window.location.hash && window.location.hash.includes('access_token')) {
    log.info("Found access_token in hash fragment, attempting direct extraction");
    
    try {
      // נסיון לחלץ ולעבד את הטוקן ישירות
      const extractSuccess = await extractAccessToken();
      
      if (extractSuccess) {
        log.info("Successfully extracted and processed access token from URL hash");
        
        // נקה פרמטרים של הפניה
        try {
          sessionStorage.removeItem('auth_redirect_initiated');
          sessionStorage.removeItem('auth_redirect_time');
          sessionStorage.removeItem('auth_redirect_count');
        } catch (e) {
          log.warn("Error clearing auth redirect indicators:", e);
        }
        
        // הצג הודעת הצלחה
        setError('');
        setLoading(false);
        
        navigate('/', { replace: true });
        return;
      }
    } catch (hashError) {
      log.error("Error processing URL hash:", { error: hashError });
    }
  }

  // נסיון אחרון - מחיקת כל נתוני האימות ומעבר לדף הבית
  try {
    // ניקוי כל מצב האימות ומחיקת נתונים
    await supabase.auth.signOut({ scope: 'global' });
    
    // ניקוי מושלם של נתוני אימות
    clearAuthStorage();
    
    // הגדרת הודעת שגיאה ומצב טעינה
    setError("התחברות נכשלה - נראה שהיתה בעיה בתהליך האימות. אנא נסה להתחבר שוב.");
    setLoading(false);
    
    // ניווט הביתה אחרי השהיה
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 2000);
  } catch (signOutError) {
    log.error("Error signing out:", { error: signOutError });
    setError("התחברות נכשלה - קרתה בעיה באימות. אנא נסה שוב.");
    setLoading(false);
    
    // ניווט הביתה גם אם ניקוי נכשל
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 2000);
  }
}
