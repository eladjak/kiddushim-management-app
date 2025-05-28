
import { useAuthCallbackState } from "./useAuthCallbackState";
import { useAuthCallbackFlow } from "./useAuthCallbackFlow";

export function useAuthCallback() {
  const { loading, error } = useAuthCallbackState();
  
  // הפעלת פלואו הקולבק
  useAuthCallbackFlow();

  return { loading, error };
}
