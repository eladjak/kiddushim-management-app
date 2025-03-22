
import { useState, useEffect, useRef } from "react";
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
  const mountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        log.info("Auth callback hook initialized, extracting session from URL...");
        
        // Try to get session without relying on the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (!mountedRef.current) return;

        if (error) {
          log.error("Error getting session:", { error });
          setError(error.message);
          setIsProcessing(false);
          return;
        }
        
        if (!data.session) {
          log.error("No session found during callback");
          setError("לא ניתן למצוא פרטי משתמש. אנא נסה להתחבר שוב.");
          setIsProcessing(false);
          return;
        }
        
        log.info("Successfully established session for user:", { 
          email: data.session.user.email,
          userId: data.session.user.id.substring(0, 8) + '...' // Log only part of the ID for security
        });
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", data.session.user.id)
          .single();
          
        if (!mountedRef.current) return;

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
        
        if (!mountedRef.current) return;

        // Successfully authenticated, show toast
        toast({
          description: "התחברת בהצלחה!",
        });
        
        // Clean URL by removing hash parameters
        // Use a try-catch to handle any encoding issues with the URL
        try {
          window.history.replaceState({}, document.title, "/");
        } catch (historyError) {
          log.error("Error cleaning URL:", { error: historyError });
          // Continue anyway
        }
        
        // Important: Use a more robust redirect approach
        timeoutRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          
          try {
            // Force a full page reload to clean all states
            window.location.replace("/");
          } catch (redirectError) {
            log.error("Error during redirect:", { error: redirectError });
            // Fallback to simple navigation if something goes wrong
            navigate("/");
          }
        }, 800);
      } catch (err: any) {
        log.error("Unexpected auth callback error:", { error: err });
        if (mountedRef.current) {
          setError(err.message || "שגיאה לא צפויה התרחשה במהלך ההתחברות");
          setIsProcessing(false);
        }
      }
    };

    handleAuthCallback();

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [navigate, location, toast]);

  return { error, isProcessing };
}
