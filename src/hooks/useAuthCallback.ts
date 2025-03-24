
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";
import { checkAndSetAdminStatus } from "@/lib/admin-utils";
import { useSessionManager } from "@/hooks/auth/useSessionManager";
import { useProfileManager } from "@/hooks/auth/useProfileManager";

export function useAuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'useAuthCallback' });
  const mountedRef = useRef(true);
  const processedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Import our new modular hooks
  const { getSession, cleanUrlHash, error, setError } = useSessionManager();
  const { checkProfile, createProfile } = useProfileManager();

  useEffect(() => {
    // Avoid double processing
    if (processedRef.current) return;
    processedRef.current = true;
    
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        log.info("Processing auth callback");
        
        // Try to get session
        const session = await getSession();
        
        if (!mountedRef.current) return;
        if (!session) {
          setIsProcessing(false);
          return;
        }
        
        // Get user details for profile creation
        const userId = session.user.id;
        const userEmail = session.user.email;
        const userName = session.user.user_metadata?.name || 
                        session.user.user_metadata?.full_name || 
                        userEmail?.split('@')[0] || 'משתמש';
        const avatarUrl = session.user.user_metadata?.avatar_url || 
                        session.user.user_metadata?.picture;
        
        // Force wait for a moment to allow the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get user profile
        let profileData = await checkProfile(userId);
          
        if (!mountedRef.current) return;

        // If profile doesn't exist, try to create it
        if (!profileData) {
          log.info("Profile not found, creating one");
          
          profileData = await createProfile(userId, userName, userEmail, avatarUrl);
          
          if (!profileData && mountedRef.current) {
            // Wait a moment and try checking again before giving up
            await new Promise(resolve => setTimeout(resolve, 1500));
            profileData = await checkProfile(userId);
          }
        } else {
          log.info("Profile already exists, proceeding");
        }
        
        // Check admin status if we have a profile
        if (profileData) {
          await checkAndSetAdminStatus(
            userEmail || "",
            profileData.id,
            profileData.role,
            toast
          );
        } else {
          log.warn("Final profile check failed, proceeding without profile");
        }
        
        if (!mountedRef.current) return;

        // Clear any URL hash to prevent re-processing on page reload
        cleanUrlHash();

        // Successfully authenticated, show toast
        toast({
          description: "התחברת בהצלחה!",
        });
        
        // Redirect to home page - FIX: Use forced browser redirect instead of navigate
        // Using window.location.href ensures a full page reload which helps with state issues
        window.location.href = "/";
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
