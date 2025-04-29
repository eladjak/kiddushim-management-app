
import { useEffect, useRef } from "react";
import { NavigateFunction } from "react-router-dom";
import { logger } from "@/utils/logger";
import { handleExistingSession } from "./handleExistingSession";
import { handleAuthCode } from "./handleAuthCode";
import { handleImplicitAuth } from "./handleImplicitAuth";
import { handleUrlCode } from "./handleUrlCode";
import { handlePkceError } from "./handlePkceError";
import { clearAuthStorage, logAuthDiagnostics } from "@/integrations/supabase/client";

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
  const maxRetriesRef = useRef(5); // הגדלנו את מספר הניסיונות

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

        log.info("מטפל בקריאת חזרה של אימות", { attemptNumber: processAttempts + 1 });
        
        // לוג מידע דיאגנוסטי לצורכי איתור בעיות
        const diagnostics = logAuthDiagnostics();
        log.info("נתוני אבחון אימות:", { diagnostics });
        
        if (processAttempts >= maxRetriesRef.current) {
          log.error("הגענו למספר ניסיונות מקסימלי", { attempts: processAttempts });
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
        
        setProcessAttempts(processAttempts + 1);

        // קביעת סדר הקדימויות שלנו - מנסים מספר שיטות בזו אחר זו
        
        // 1. בדיקה אם כבר קיים סשן פעיל
        const sessionExists = await handleExistingSession(navigate, toastHelper);
        if (sessionExists) return;
        
        // 2. אימות באמצעות אקסס-טוקן בפרגמנט (Implicit Flow)
        if (window.location.hash && window.location.hash.includes('access_token')) {
          try {
            log.info("נמצא access_token ב-hash, מנסה זרימת Implicit");
            const implicitAuthSuccess = await handleImplicitAuth(navigate, toastHelper);
            if (implicitAuthSuccess) return;
            log.warn("זרימת Implicit נכשלה, ממשיך לשיטה הבאה");
          } catch (err) {
            log.error("שגיאה בזרימת Implicit:", { error: err });
          }
        }
        
        // 3. אם יש קוד אימות בסטייט (מהנתב)
        if (location.state?.code && location.state.code.length > 10) {
          try {
            log.info("משתמש בקוד מ-location state");
            const stateCodeSuccess = await handleAuthCode(
              location.state.code, 
              location.state?.authSource || 'location_state', 
              navigate, 
              toastHelper
            );
            
            if (stateCodeSuccess) return;
            log.warn("עיבוד קוד מ-location state נכשל");
          } catch (err) {
            log.error("שגיאה בטיפול בקוד מ-state:", { error: err });
          }
        }
        
        // 4. טיפול בקוד אימות מה-URL
        try {
          const urlCodeSuccess = await handleUrlCode(navigate, toastHelper);
          if (urlCodeSuccess) return;
          log.warn("עיבוד קוד מה-URL נכשל");
        } catch (err) {
          log.error("שגיאה בעיבוד קוד URL:", { error: err });
        }

        // אם אף שיטה לא הצליחה
        if (isMounted) {
          log.error("אף שיטת אימות לא הצליחה");
          
          // בדיקה לבעיית SSL certificate
          const hostHasWWW = window.location.hostname.startsWith("www.");
          const isProduction = window.location.hostname.includes("kidushishi-menegment-app.co.il");
          
          if (isProduction && !hostHasWWW) {
            log.warn("זוהתה אפשרות לאי התאמה בתעודת SSL");
            
            // הפניה ידנית לדומיין עם www
            const redirectUrl = window.location.href.replace(
              "kidushishi-menegment-app.co.il",
              "www.kidushishi-menegment-app.co.il"
            );
            
            log.info("מפנה לדומיין עם www", { redirectUrl });
            setError("מתבצעת הפניה מחדש לדומיין עם www...");
            
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 1000);
            
            return;
          }
          
          clearAuthStorage();
          await handlePkceError(navigate, setError, setLoading);
        }
      } catch (err: any) {
        log.error("שגיאה בלתי צפויה בקריאת חזרה של אימות:", { error: err });
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
      log.info("דף קריאת חזרה של אימות נסגר");
    };
  }, []);
}
