
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Define the Supabase URL and key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://uqumzjmyejlhoyliyesu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdW16am15ZWpsaG95bGl5ZXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwODA1MDIsImV4cCI6MjA1NDY1NjUwMn0.btzU9O72DPhxW_gm_G_AKPOaVBuKI8F4KSrnhdNmRO8";

// Create a unique key for this domain to avoid storage conflicts
const getStorageKey = () => {
  try {
    const hostname = window.location.hostname;
    // Handle both www and non-www versions to use the same storage key
    // Strip www prefix for consistency and to avoid SSL issues
    const normalizedHostname = hostname.replace(/^www\./, '');
    return `kidushishi-auth-token-${normalizedHostname}`;
  } catch (e) {
    // Fallback if window is not available (SSR)
    return 'kidushishi-auth-token-default';
  }
};

// Create a single supabase client instance for the entire app
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // IMPORTANT: Disable automatic detection to handle it manually
    storageKey: getStorageKey(),
    storage: localStorage,
    flowType: 'implicit', // Use implicit flow which is more reliable across browsers
    debug: import.meta.env.DEV, // Enable debug mode in development
  },
  global: {
    headers: {
      'X-Client-Info': 'lovable-web-app'
    }
  }
});

// Export a function to get the storage key for other components
export const getAuthStorageKey = getStorageKey;

// Export a domain normalization function to help with URL redirection issues
export const getNormalizedDomain = () => {
  try {
    const hostname = window.location.hostname;
    // Ensure we use www for the production domain to match SSL certificate
    if (hostname === 'kidushishi-menegment-app.co.il') {
      return 'www.kidushishi-menegment-app.co.il';
    }
    return hostname;
  } catch (e) {
    return '';
  }
};
