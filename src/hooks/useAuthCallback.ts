
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

  useEffect(() => {
    // Set mounted flag
    mountedRef.current = true;
    
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        log.info("Auth callback hook initialized, extracting session from URL...");
        
        // Try to get session without relying on the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          log.error("Error getting session:", { error });
          if (mountedRef.current) {
            setError(error.message);
            setIsProcessing(false);
          }
          return;
        }
        
        if (!data.session) {
          // Maybe we need to extract the token from URL hash directly?
          if (window.location.hash && window.location.hash.includes('access_token')) {
            log.info("No session found but hash exists, trying to set session from hash...");
            // Let supabase process the hash
            await supabase.auth.getSession();
            
            // Check again for session
            const { data: refreshedData, error: refreshError } = await supabase.auth.getSession();
            
            if (refreshError || !refreshedData.session) {
              log.error("Failed to get session after hash processing", { error: refreshError });
              if (mountedRef.current) {
                setError("לא ניתן למצוא פרטי משתמש. אנא נסה להתחבר שוב.");
                setIsProcessing(false);
              }
              return;
            }
            
            // We have a session now, proceed with it
            if (mountedRef.current) {
              // Clean URL by removing hash parameters
              try {
                window.history.replaceState({}, document.title, "/");
              } catch (historyError) {
                log.error("Error cleaning URL:", { error: historyError });
              }
              
              // Show toast and redirect
              toast({
                description: "התחברת בהצלחה!",
              });
              
              setTimeout(() => {
                if (mountedRef.current) {
                  window.location.href = "/";
                }
              }, 800);
            }
            return;
          } else {
            log.error("No session found during callback");
            if (mountedRef.current) {
              setError("לא ניתן למצוא פרטי משתמש. אנא נסה להתחבר שוב.");
              setIsProcessing(false);
            }
            return;
          }
        }
        
        log.info("Successfully established session for user:", { 
          email: data.session.user.email,
          userId: data.session.user.id.substring(0, 8) + '...' // Log only part of the ID for security
        });
        
        // Clean URL by removing hash parameters
        try {
          window.history.replaceState({}, document.title, "/");
        } catch (historyError) {
          log.error("Error cleaning URL:", { error: historyError });
        }
        
        // Successfully authenticated, show toast
        if (mountedRef.current) {
          toast({
            description: "התחברת בהצלחה!",
          });
        }
        
        // Important: Use a more robust redirect approach
        setTimeout(() => {
          try {
            // Force a full page reload to clean all states
            if (mountedRef.current) {
              window.location.href = "/";
            }
          } catch (redirectError) {
            log.error("Error during redirect:", { error: redirectError });
            if (mountedRef.current) {
              navigate("/");
            }
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
    };
  }, [navigate, location, toast]);

  return { error, isProcessing };
}
