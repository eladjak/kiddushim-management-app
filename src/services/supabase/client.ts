
import { createClient } from '@supabase/supabase-js';

// נתוני התחברות שיועברו למשתני סביבה בשלב מאוחר יותר
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// בדיקה שנתוני ההתחברות קיימים
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// Create a unique key for this domain to avoid storage conflicts
const getStorageKey = () => {
  const hostname = window.location.hostname;
  return `kidushishi-auth-token-${hostname}`;
};

// יצירת לקוח Supabase יחיד ושימוש בו בכל האפליקציה
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: getStorageKey(),
    flowType: 'pkce'
  },
});

// Export a function to get the storage key for other components
export const getAuthStorageKey = getStorageKey;

export default supabase;
