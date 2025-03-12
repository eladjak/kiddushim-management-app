
import { useEffect } from "react";
import { setupStorage } from "@/integrations/supabase/setupStorage";
import { logger } from "@/utils/logger";

export function useStorage() {
  const log = logger.createLogger({ component: 'useStorage' });
  
  useEffect(() => {
    setupStorage()
      .catch(error => {
        log.error("Failed to setup storage:", { error });
      });
  }, []);
}
