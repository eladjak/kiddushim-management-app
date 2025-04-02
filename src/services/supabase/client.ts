
// Import the shared client from the integrations directory
import { supabase, getAuthStorageKey } from '@/integrations/supabase/client';

// Re-export the client and utils
export { supabase, getAuthStorageKey };

// Default export for backward compatibility
export default supabase;
