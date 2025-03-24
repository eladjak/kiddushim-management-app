
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkAndSetAdminStatus } from "@/lib/admin-utils";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

export function useAuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'useAuthCallback' });
  const mountedRef = useRef(true);
  const processedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Avoid double processing
    if (processedRef.current) return;
    processedRef.current = true;
    
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        log.info("Processing auth callback");
        
        // Try to get session
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
        
        log.info("Session established during callback");
        
        // Force wait for a moment to allow the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", data.session.user.id)
          .maybeSingle();
          
        if (!mountedRef.current) return;

        if (profileError && profileError.code !== 'PGRST116') {
          log.error("Error fetching profile:", { error: profileError });
          // Continue anyway - we'll try to create the profile
        }
        
        // If profile doesn't exist, try to create it
        if (!profileData) {
          log.info("Profile not found, creating one");
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: data.session.user.id,
              name: data.session.user.user_metadata?.name || 
                   data.session.user.user_metadata?.full_name || 
                   data.session.user.email?.split('@')[0] || 'משתמש',
              email: data.session.user.email,
              language: 'he', // Default to Hebrew
              role: 'coordinator', // Default role
              avatar_url: data.session.user.user_metadata?.avatar_url || data.session.user.user_metadata?.picture,
              shabbat_mode: false
            });
          
          if (createError) {
            log.error("Error creating profile:", { error: createError });
            // Continue anyway - the profile might be created by another process
          } else {
            log.info("Profile created successfully during auth callback");
          }
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
        
        // Make sure to remove the hash
        try {
          window.history.replaceState({}, document.title, "/");
        } catch (historyError) {
          log.error("Error cleaning URL:", { error: historyError });
        }
        
        // Controlled redirect with timeout to ensure state updates are processed
        timeoutRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          
          try {
            // Navigate to home page
            navigate("/", { replace: true });
          } catch (redirectError) {
            log.error("Error during redirect:", { error: redirectError });
            // Fallback to simple redirect if something goes wrong
            window.location.href = "/";
          }
        }, 1000);
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
  }, [navigate, toast]);

  return { error, isProcessing };
}
