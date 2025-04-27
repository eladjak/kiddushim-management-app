
import { useToast } from "@/hooks/use-toast";
import { supabase, getNormalizedDomain } from "@/integrations/supabase/client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";

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
   * Clear all auth data from localStorage to avoid stale state
   */
  const clearAuthData = () => {
    log.info('Clearing auth data from localStorage');
    // Remove all auth-related items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('supabase.auth.') || key.includes('kidushishi-auth-token'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    log.info('Cleared auth data from localStorage', { count: keysToRemove.length });
    
    // Also clear from sessionStorage
    sessionStorage.removeItem('auth_redirect_count');
    sessionStorage.removeItem('auth_redirect_initiated');
    sessionStorage.removeItem('auth_redirect_time');
  };

  /**
   * Gets a normalized redirect URL that works in both development and production
   * Always uses the www. subdomain on production to match SSL certificate
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
   * Initiates Google Sign In flow - optimized for working correctly with access tokens
   */
  const signInWithGoogle = async () => {
    // Prevent multiple clicks
    if (authInProgressRef.current || isLoading) return;
    
    log.info('Initiating Google sign in');
    
    try {
      setIsLoading(true);
      authInProgressRef.current = true;
      
      // Get normalized redirect URL
      const redirectUrl = getRedirectUrl();
      log.info('Using redirect URL for OAuth flow:', { redirectUrl });
      
      // Clean up existing auth data
      clearAuthData();
      
      // Explicit sign out before starting new sign in flow
      try {
        await supabase.auth.signOut({ scope: 'local' });
        log.info('Successfully signed out before new sign in');
      } catch (signOutError) {
        log.warn('Error during sign out before sign in:', { error: signOutError });
        // Continue anyway as it's not critical
      }
      
      // Short delay before starting new process
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Initiate Google auth - using implicit flow which works better with Google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
          queryParams: {
            prompt: 'select_account', // Always show account selector
            access_type: 'offline',   // Get refresh token
          },
        },
      });
      
      if (error) {
        log.error("Google auth error:", { error });
        throw error;
      }
      
      if (!data?.url) {
        log.error("Google auth failed - No URL returned");
        throw new Error("לא התקבלה כתובת התחברות מתאימה");
      }
      
      log.info('Google auth initiated successfully', { 
        url: data.url.substring(0, 50) + '...',
        provider: data.provider
      });
      
      toast({
        description: "מועבר להתחברות עם Google...",
      });
      
      // Store auth state in sessionStorage instead of localStorage
      try {
        sessionStorage.setItem('auth_redirect_initiated', 'true');
        sessionStorage.setItem('auth_redirect_time', new Date().toISOString());
      } catch (e) {
        log.warn('Could not save auth state to sessionStorage', { error: e });
      }
      
      // Navigate to auth URL - with new flag to bypass blockers
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
      onClick={signInWithGoogle}
      disabled={isLoading}
      className="w-full h-10 border border-gray-200 hover:bg-secondary/50 transition-all duration-200 flex items-center justify-center gap-2"
    >
      <img
        src="https://www.google.com/favicon.ico"
        alt="Google"
        className="w-4 h-4"
      />
      {isLoading ? "טוען..." : "התחבר עם Google"}
    </Button>
  );
};
