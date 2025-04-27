
import { useToast } from "@/hooks/use-toast";
import { supabase, configureAuthProvider, getNormalizedDomain, clearAuthStorage } from "@/integrations/supabase/client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";
import { FcGoogle } from "react-icons/fc";

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
      
      // Clean up existing auth data
      clearAuthStorage();
      
      // Sign out before starting new sign in flow
      try {
        await supabase.auth.signOut();
        log.info('Successfully signed out before new sign in');
      } catch (signOutError) {
        log.warn('Error during sign out before sign in:', { error: signOutError });
      }
      
      // Small delay before starting new process
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get proper redirect URL
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      // Generate and store code verifier for PKCE - בשלב זה כבר לא צריך בזכות flowType: 'pkce' בקליינט
      // supabase.auth עושה את זה אוטומטית
      
      // Initiate Google auth with explicit provider options
      configureAuthProvider('google');
      
      // הוספנו אופציות מפורטות יותר לאימות כדי לפתור בעיות שונות
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
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
      
      // Store auth state in sessionStorage for reliability
      try {
        const timestamp = new Date().toISOString();
        sessionStorage.setItem('auth_redirect_initiated', 'true');
        sessionStorage.setItem('auth_redirect_time', timestamp);
        sessionStorage.setItem('auth_provider', 'google');
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
