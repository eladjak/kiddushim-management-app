
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export function useAuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const log = logger.createLogger({ component: 'useAuthCallback' });

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        log.info("Handling auth callback");
        setLoading(true);
        
        // Check URL for errors first
        const url = new URL(window.location.href);
        const errorParam = url.searchParams.get("error");
        const errorDescription = url.searchParams.get("error_description");
        
        if (errorParam) {
          const errorMsg = errorDescription || `Authentication error: ${errorParam}`;
          log.error("Auth callback URL contains error:", { error: errorMsg });
          setError(errorMsg);
          setLoading(false);
          return;
        }
        
        // Get session from URL hash if available
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          log.error("Error getting session in auth callback:", error);
          setError(error.message);
          setLoading(false);
          return;
        }
        
        if (!data.session) {
          log.warn("No session found in auth callback");
          setError("התחברות נכשלה - לא נמצאה סשן משתמש");
          setLoading(false);
          return;
        }
        
        // Successfully authenticated
        log.info("Auth callback successful, redirecting to home", { 
          userId: data.session.user.id 
        });
        
        // Force reload to ensure session is properly set in all components
        setTimeout(() => {
          navigate("/", { replace: true });
          setLoading(false);
        }, 500);
      } catch (err: any) {
        log.error("Unexpected error in auth callback:", err);
        setError(err.message || "אירעה שגיאה בלתי צפויה בתהליך ההתחברות");
        setLoading(false);
      }
    }

    handleAuthCallback();
  }, [navigate]);

  return { loading, error };
}
