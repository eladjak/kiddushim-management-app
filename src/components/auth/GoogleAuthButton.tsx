
import { useToast } from "@/hooks/use-toast";
import { supabase, configureAuthProvider, getNormalizedDomain, clearAuthStorage } from "@/integrations/supabase/client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";
import { FcGoogle } from "react-icons/fc";

/**
 * השגת מחרוזת רנדומלית בקידוד בטוח עבור PKCE
 * גרסה משופרת שבטוח עובדת עם תווים לא לטיניים
 * @param length אורך המחרוזת הרצוי
 */
const generatePKCEString = (length: number): string => {
  // תווים בטוחים לשימוש ב-URL - רק אותיות לטיניות ומספרים
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  try {
    // שימוש בערכים אקראיים בטוחים
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    return result;
  } catch (e) {
    // גיבוי למקרה של שגיאה
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }
};

/**
 * Google authentication button component
 * Handles the Google OAuth sign-in flow
 */
export const GoogleAuthButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const authInProgressRef = useRef(false);
  const log = logger.createLogger({ component: 'GoogleAuthButton' });

  /**
   * Gets a normalized redirect URL with www subdomain if needed
   */
  const getRedirectUrl = () => {
    const normalizedDomain = getNormalizedDomain();
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    
    const baseUrl = `${protocol}//${normalizedDomain}${port}`;
    const redirectPath = "/auth/callback";
    const fullRedirectUrl = `${baseUrl}${redirectPath}`;
    
    log.info('Generated redirect URL:', { redirectUrl: fullRedirectUrl });
    return fullRedirectUrl;
  };

  /**
   * Initiates Google Sign In flow
   */
  const handleGoogleSignIn = async () => {
    // Prevent multiple clicks
    if (authInProgressRef.current || isLoading) return;
    
    log.info('Initiating Google sign in');
    
    try {
      setIsLoading(true);
      authInProgressRef.current = true;
      
      // Clean up existing auth data and session
      try {
        clearAuthStorage();
        log.info('Successfully cleared auth state before new sign in');
      } catch (signOutError) {
        log.warn('Error during cleanup before sign in:', { error: signOutError });
      }
      
      // Small delay before starting new process
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get proper redirect URL with www prefix if needed
      const redirectTo = getRedirectUrl();
      
      // Generate a code verifier for PKCE - שימוש בגרסה המשופרת שבטוח עובדת עם תווים לא לטיניים
      const codeVerifier = generatePKCEString(64);
      
      try {
        // Store in localStorage instead of sessionStorage for better persistence
        localStorage.setItem('supabase-code-verifier', codeVerifier);
        localStorage.setItem('code-verifier-timestamp', Date.now().toString());
        
        // Also store in sessionStorage as backup
        sessionStorage.setItem('supabase-code-verifier', codeVerifier);
        
        log.info('Generated and stored code verifier for PKCE', { 
          verifierLength: codeVerifier.length,
          verifierStart: codeVerifier.substring(0, 5) + '...'
        });
      } catch (storageError) {
        log.error('Error storing code verifier:', { error: storageError });
      }
      
      // Configure auth provider with appropriate flow
      configureAuthProvider('google');
      
      // Initiate OAuth flow with detailed options
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false,
          scopes: 'email profile',
          queryParams: {
            access_type: 'offline', 
            prompt: 'select_account',
            hd: '*', // לאפשר כל דומיין
            hl: 'he' // הגדרת שפה לעברית
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data?.url) {
        throw new Error("לא התקבלה כתובת התחברות מתאימה");
      }
      
      log.info('Google auth initiated successfully, redirecting to:', { 
        provider: data.provider,
        urlLength: data.url.length
      });
      
      toast({
        description: "מועבר להתחברות עם Google...",
      });
      
      // Store auth state info for reliability
      try {
        const timestamp = new Date().toISOString();
        localStorage.setItem('auth_redirect_initiated', 'true');
        localStorage.setItem('auth_redirect_time', timestamp);
        localStorage.setItem('auth_provider', 'google');
      } catch (e) {
        log.error('Could not save auth state to storage', { error: e });
      }
      
      // Navigate to Google auth URL
      window.location.href = data.url;
      
    } catch (error: any) {
      log.error("Google auth error:", { error });
      
      let errorMessage = `שגיאה בהתחברות עם Google: ${error.message}`;
      
      if (error.message && error.message.includes("redirect_uri_mismatch")) {
        errorMessage = `שגיאה: אי התאמה בכתובת ההפניה. יש לוודא שהכתובת ${getRedirectUrl()} מוגדרת ב-Google Cloud Console`;
      }
      
      toast({
        variant: "destructive",
        description: errorMessage,
      });
      
      // Reset state
      setIsLoading(false);
      authInProgressRef.current = false;
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full h-10 border border-gray-200 hover:bg-secondary/50 transition-all duration-200 flex items-center justify-center gap-2"
      data-testid="google-auth-button"
    >
      <FcGoogle className="w-4 h-4" />
      {isLoading ? "טוען..." : "התחבר עם Google"}
    </Button>
  );
};
