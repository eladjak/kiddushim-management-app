
import { useState, useRef } from "react";
import { logger } from "@/utils/logger";

export function useAuthCallbackState() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processAttempts, setProcessAttempts] = useState(0);
  const processingRef = useRef(false);
  const mountedRef = useRef(true);
  const hasRunRef = useRef(false);
  const log = logger.createLogger({ component: 'useAuthCallbackState' });

  return {
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
  };
}
