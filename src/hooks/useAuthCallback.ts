
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkAndSetAdminStatus } from "@/lib/admin-utils";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

export function useAuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'useAuthCallback' });

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        log.info("Auth callback hook initialized, extracting session from URL...");
        
        // Get the hash if we were redirected from the /auth/callback route
        // or if we're on the index page with a hash
        const urlHash = window.location.hash || location.hash;
        
        // If we have a hash with tokens, log it (without the tokens)
        if (urlHash && urlHash.includes('access_token=')) {
          log.info("Found auth hash in URL", { 
            hasAccessToken: urlHash.includes('access_token='),
            hasExpiresAt: urlHash.includes('expires_at='),
            hasRefreshToken: urlHash.includes('refresh_token=')
          });
        }
        
        // The URL includes the access token and refresh token as hash parameters
        // Supabase Auth will automatically extract these and establish the session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          log.error("Error getting session from URL:", { error });
          setError(error.message);
          setIsProcessing(false);
          return;
        }
        
        if (!data.session) {
          log.error("No session found in callback URL");
          setError("לא ניתן למצוא פרטי משתמש בקישור. אנא נסה להתחבר שוב.");
          setIsProcessing(false);
          return;
        }
        
        log.info("Successfully established session for user:", { email: data.session.user.email });
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", data.session.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          log.error("Error fetching profile:", { error: profileError });
          // Continue anyway - the trigger should create the profile
        }
        
        // Check admin status if we have a profile
        if (profileData) {
          await checkAndSetAdminStatus(
            data.session.user.email || "",
            profileData.id,
            profileData.role,
            toast
          );
        }
        
        // Successfully authenticated, redirect to home
        toast({
          description: "התחברת בהצלחה!",
        });
        
        // First clean URL by removing hash parameters
        window.history.replaceState({}, document.title, "/");
        
        // Then navigate to home page
        navigate("/", { replace: true });
      } catch (err: any) {
        log.error("Unexpected auth callback error:", { error: err });
        setError(err.message || "שגיאה לא צפויה התרחשה במהלך ההתחברות");
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, location, toast]);

  return { error, isProcessing };
}
