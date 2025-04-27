
import { useEffect, useRef } from "react";
import { NavigateFunction } from "react-router-dom";
import { logger } from "@/utils/logger";
import { handleExistingSession } from "./handleExistingSession";
import { handleAuthCode } from "./handleAuthCode";
import { handleImplicitAuth } from "./handleImplicitAuth";
import { handleUrlCode } from "./handleUrlCode";
import { handlePkceError } from "./handlePkceError";
import { clearAuthStorage } from "@/integrations/supabase/client";

interface ProcessAuthCallbackProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  processAttempts: number;
  setProcessAttempts: (attempts: number) => void;
  processingRef: React.MutableRefObject<boolean>;
  mountedRef: React.MutableRefObject<boolean>;
  hasRunRef: React.MutableRefObject<boolean>;
  navigate: NavigateFunction;
  toastHelper: any;
  location: any;
}

export function useProcessAuthCallback({
  loading,
  setLoading,
  setError,
  processAttempts,
  setProcessAttempts,
  processingRef,
  mountedRef,
  hasRunRef,
  navigate,
  toastHelper,
  location
}: ProcessAuthCallbackProps) {
  const log = logger.createLogger({ component: 'useProcessAuthCallback' });
  const maxRetriesRef = useRef(2);

  useEffect(() => {
    let isMounted = true;
    
    if (processingRef.current || hasRunRef.current) {
      return;
    }

    processingRef.current = true;
    hasRunRef.current = true;

    async function processAuthCallback() {
      try {
        if (!isMounted) return;

        log.info("Handling auth callback", { attemptNumber: processAttempts + 1 });
        
        if (processAttempts >= maxRetriesRef.current) {
          log.error("Maximum auth processing attempts reached", { attempts: processAttempts });
          setError("מספר נסיונות מקסימלי הושג. מועבר לדף הבית...");
          setLoading(false);
          
          setTimeout(() => {
            if (isMounted) {
              clearAuthStorage();
              navigate("/", { replace: true });
            }
          }, 1500);
          
          return;
        }
        
        // שינוי כאן - הפיכת הקריאה לקריאה ישירה עם מספר במקום פונקציה
        setProcessAttempts(processAttempts + 1);

        // Try each auth method in sequence
        const sessionExists = await handleExistingSession(navigate, toastHelper);
        if (sessionExists) return;
        
        if (location.state?.code && location.state.code.length > 10) {
          try {
            log.info("Using code from location state");
            await handleAuthCode(location.state.code, location.state?.authSource || 'location_state', navigate, toastHelper);
            return;
          } catch (err) {
            log.error("Error handling state code:", { error: err });
            if (isMounted) {
              clearAuthStorage();
              await handlePkceError(navigate, setError, setLoading);
              return;
            }
          }
        }

        const implicitAuthSuccess = await handleImplicitAuth(navigate, toastHelper);
        if (implicitAuthSuccess) return;
        
        try {
          const urlCodeSuccess = await handleUrlCode(navigate, toastHelper);
          if (urlCodeSuccess) return;
        } catch (err) {
          log.error("Error processing URL code:", { error: err });
          if (isMounted) {
            clearAuthStorage();
            await handlePkceError(navigate, setError, setLoading);
            return;
          }
        }

        if (isMounted) {
          log.error("No authentication method succeeded");
          clearAuthStorage();
          await handlePkceError(navigate, setError, setLoading);
        }
      } catch (err: any) {
        log.error("Unexpected error in auth callback:", { error: err });
        if (isMounted) {
          setError(err.message || "אירעה שגיאה בלתי צפויה בתהליך ההתחברות");
          setLoading(false);
          
          setTimeout(() => {
            clearAuthStorage();
            navigate("/", { replace: true });
          }, 2000);
        }
      } finally {
        if (isMounted) {
          processingRef.current = false;
          setLoading(false);
        }
      }
    }

    processAuthCallback();

    return () => {
      isMounted = false;
      log.info("Auth callback page unmounted");
    };
  }, []);
}
