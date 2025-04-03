
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
  
  // Check if we were redirected from www.domain to domain or vice versa
  const hostname = window.location.hostname;
  const isNonWwwDomain = hostname === 'kidushishi-menegment-app.co.il';
  
  if (isNonWwwDomain) {
    log.info("Detected non-www domain that may cause SSL issues", { hostname });
    
    setError("ההתחברות נכשלה בגלל בעיית תעודה - לאתר יש תעודת אבטחה רק עבור www.kidushishi-menegment-app.co.il, לא kidushishi-menegment-app.co.il. אנא השתמש בכתובת המתחילה ב-www.");
    setLoading(false);
    return;
  }
  
  // Clean up all auth state and redirect to auth page
  await supabase.auth.signOut({ scope: 'global' });
  
  // Clear out any leftover verifiers
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('supabase.auth.') || key.includes('kidushishi-auth-token'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  setError("התחברות נכשלה - קרתה בעיה באימות. אנא נסה שוב.");
  setLoading(false);
}
