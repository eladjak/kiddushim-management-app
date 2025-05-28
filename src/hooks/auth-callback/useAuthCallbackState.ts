
import { useState } from "react";

/**
 * מנהל מצב עבור רכיב AuthCallback
 */
export function useAuthCallbackState() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return {
    loading,
    setLoading,
    error,
    setError,
  };
}
