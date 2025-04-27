
import { NavigateFunction } from "react-router-dom";
import { supabase, clearAuthStorage } from "@/integrations/supabase/client";
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
  
  // ניקוי נתוני סשן ספציפיים
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
    log.info("Found access_token in hash fragment, attempting to process");
    
    try {
      // חילוץ טוקן ישירות
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken) {
        log.info("Extracted access token from hash fragment, attempting to set session");
        
        // ניסיון להגדיר את הסשן ישירות עם הטוקן
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (!error && data.session) {
          log.info("Successfully processed access token from URL hash");
          navigate('/', { replace: true });
          return;
        } else if (error) {
          log.error("Error authenticating with access token:", { error });
        }
      }
    } catch (hashError) {
      log.error("Error processing URL hash:", { error: hashError });
    }
  }

  // נסיון אחרון - מחיקת כל נתוני האימות ומעבר לדף הבית
  try {
    // ניקוי כל מצב האימות ומחיקת נתונים
    await supabase.auth.signOut({ scope: 'local' });
    
    // ניקוי מושלם של נתוני אימות
    clearAuthStorage();
    
    // הגדרת הודעת שגיאה ומצב טעינה
    setError("התחברות נכשלה - קרתה בעיה באימות. אנא נסה שוב.");
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
