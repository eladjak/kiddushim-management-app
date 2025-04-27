
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Handle PKCE errors or certificate domain mismatches
 */
export async function handlePkceError(
  navigate: NavigateFunction,
  setError: (error: string) => void,
  setLoading: (loading: boolean) => void
): Promise<void> {
  const log = logger.createLogger({ component: 'handlePkceError' });
  log.info("Handling potential PKCE error or SSL certificate domain mismatch");
  
  // Check if we are stuck in redirect loop
  const redirectCount = parseInt(sessionStorage.getItem('auth_redirect_count') || '0');
  if (redirectCount > 2) {
    log.error("Detected redirect loop, breaking the cycle");
    sessionStorage.removeItem('auth_redirect_count');
    setError("זוהתה לולאת הפניות. הקשר לתמיכה הטכנית אם הבעיה נמשכת.");
    setLoading(false);
    return;
  }
  
  // Check if we were redirected from www.domain to domain or vice versa
  const hostname = window.location.hostname;
  const isNonWwwDomain = hostname === 'kidushishi-menegment-app.co.il';
  
  if (isNonWwwDomain) {
    log.info("Detected non-www domain that may cause SSL issues", { hostname });
    
    setError("ההתחברות נכשלה בגלל בעיית תעודת SSL - התעודה תקפה עבור www.kidushishi-menegment-app.co.il בלבד. מועבר אוטומטית לכתובת הנכונה...");
    
    // Store the redirect count in sessionStorage
    sessionStorage.setItem('auth_redirect_count', (redirectCount + 1).toString());
    
    // Give user time to see the message before redirecting
    setTimeout(() => {
      const protocol = window.location.protocol;
      const pathname = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      
      window.location.href = `${protocol}//www.kidushishi-menegment-app.co.il${pathname}${search}${hash}`;
    }, 1000);
    
    return;
  }
  
  // בדוק אם יש פרמטרי access_token בפרגמנט
  if (window.location.hash && window.location.hash.includes('access_token')) {
    log.info("Found access_token in hash fragment, attempting to process");
    
    try {
      // Extract token directly
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken) {
        log.info("Extracted access token from hash fragment, attempting to set session");
        
        // Try to set the session directly with the token
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

  // Clean up all auth state and redirect to auth page
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch (signOutError) {
    log.error("Error signing out:", { error: signOutError });
  }
  
  // Clear all auth data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('supabase.auth.') || key.includes('kidushishi-auth-token'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear session storage
  sessionStorage.removeItem('auth_redirect_count');
  sessionStorage.removeItem('auth_redirect_initiated');
  sessionStorage.removeItem('auth_redirect_time');
  
  setError("התחברות נכשלה - קרתה בעיה באימות. אנא נסה שוב.");
  setLoading(false);
}
