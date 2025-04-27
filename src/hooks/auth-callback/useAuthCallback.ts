
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthCallbackState } from "./useAuthCallbackState";
import { useSafetyTimeout } from "./useSafetyTimeout";
import { useProcessAuthCallback } from "./useProcessAuthCallback";

export function useAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const toastHelper = useToast();
  
  const {
    loading,
    setLoading,
    error,
    setError,
    processAttempts,
    setProcessAttempts,
    processingRef,
    mountedRef,
    hasRunRef,
    log
  } = useAuthCallbackState();

  useSafetyTimeout({
    loading,
    mountedRef,
    setError,
    setLoading,
    navigate
  });

  useProcessAuthCallback({
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
  });

  return { loading, error };
}
