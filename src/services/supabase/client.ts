
// Import the shared client from the integrations directory
import { supabase, clearAuthStorage } from '@/integrations/supabase/client';

// Re-export the client and utils
export { supabase, clearAuthStorage };

// Default export for backward compatibility
export default supabase;
