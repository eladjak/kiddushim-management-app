
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Define the Supabase URL and key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://uqumzjmyejlhoyliyesu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdW16am15ZWpsaG95bGl5ZXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwODA1MDIsImV4cCI6MjA1NDY1NjUwMn0.btzU9O72DPhxW_gm_G_AKPOaVBuKI8F4KSrnhdNmRO8";

// Create a unique key for this domain to avoid storage conflicts
const getStorageKey = () => {
  const hostname = window.location.hostname;
  return `kidushishi-auth-token-${hostname}`;
};

// Create a single supabase client instance for the entire app
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // IMPORTANT: Set to false to prevent automatic processing
    storageKey: getStorageKey(),
    storage: localStorage,
    flowType: 'pkce'
  }
});

// Export a function to get the storage key for other components
export const getAuthStorageKey = getStorageKey;
