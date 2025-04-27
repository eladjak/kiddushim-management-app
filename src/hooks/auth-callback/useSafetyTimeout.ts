
import { useEffect } from "react";
import { NavigateFunction } from "react-router-dom";
import { logger } from "@/utils/logger";

interface SafetyTimeoutProps {
  loading: boolean;
  mountedRef: React.MutableRefObject<boolean>;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  navigate: NavigateFunction;
}

export function useSafetyTimeout({
  loading,
  mountedRef,
  setError,
  setLoading,
  navigate
}: SafetyTimeoutProps) {
  const log = logger.createLogger({ component: 'useSafetyTimeout' });

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (mountedRef.current && loading) {
        log.warn("Safety timeout triggered in auth callback");
        setError("תם הזמן המוקצב לתהליך ההתחברות. מועבר לדף הבית...");
        setLoading(false);
        
        setTimeout(() => {
          if (mountedRef.current) {
            navigate("/", { replace: true });
          }
        }, 1000);
      }
    }, 8000);

    return () => clearTimeout(safetyTimer);
  }, [loading, mountedRef, setError, setLoading, navigate]);
}
