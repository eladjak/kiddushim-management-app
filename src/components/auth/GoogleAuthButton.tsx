
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
    log.info('Clearing auth data from storage');
    
    try {
      // Remove all auth-related items from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('supabase.auth.') || 
          key.includes('kidushishi-auth-token') ||
          key.includes('oauth')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      log.info('Cleared auth data from localStorage', { count: keysToRemove.length });
    } catch (err) {
      log.error('Error clearing localStorage:', { error: err });
    }
    
    // Also clear from sessionStorage
    try {
      sessionStorage.removeItem('auth_redirect_count');
      sessionStorage.removeItem('auth_redirect_initiated');
      sessionStorage.removeItem('auth_redirect_time');
    } catch (err) {
      log.error('Error clearing sessionStorage:', { error: err });
    }
  };

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
      
      // Sign out before starting new sign in flow
      try {
        await supabase.auth.signOut();
        log.info('Successfully signed out before new sign in');
      } catch (signOutError) {
        log.warn('Error during sign out before sign in:', { error: signOutError });
        // Continue anyway
      }
      
      // Small delay before starting new process
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Initiate Google auth with explicit provider options
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            // Ensures we get a refresh token
            access_type: 'offline',
            // Forces consent screen to always appear
            prompt: 'consent',
            // Request email scope
            scope: 'email profile',
          }
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (!data?.url) {
        throw new Error("לא התקבלה כתובת התחברות מתאימה");
      }
      
      log.info('Google auth initiated successfully', { 
        provider: data.provider,
        urlLength: data.url.length
      });
      
      toast({
        description: "מועבר להתחברות עם Google...",
      });
      
      // Store auth state in both localStorage and sessionStorage for reliability
      try {
        const timestamp = new Date().toISOString();
        sessionStorage.setItem('auth_redirect_initiated', 'true');
        sessionStorage.setItem('auth_redirect_time', timestamp);
        
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
      onClick={signInWithGoogle}
      disabled={isLoading}
      className="w-full h-10 border border-gray-200 hover:bg-secondary/50 transition-all duration-200 flex items-center justify-center gap-2"
      data-testid="google-auth-button"
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
