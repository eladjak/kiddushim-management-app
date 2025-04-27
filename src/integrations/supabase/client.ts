
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
    const normalizedHostname = hostname.replace(/^www\./, '');
    return `kidushishi-auth-token-${normalizedHostname}`;
  } catch (e) {
    // Fallback if window is not available (SSR)
    return 'kidushishi-auth-token-default';
  }
};

// Get the storage key
const storageKey = getStorageKey();

// Create a single supabase client instance for the entire app
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,          // Enable session persistence
    autoRefreshToken: true,        // Automatically refresh tokens
    detectSessionInUrl: true,      // Auto-detect access_token in URL
    storageKey: storageKey,        // Use a consistent storage key
    storage: localStorage,         // Use localStorage for persistence
    debug: import.meta.env.DEV,    // Enable debug mode in development
    flowType: 'pkce',              // Use PKCE for OAuth flow
  },
  global: {
    headers: {
      'X-Client-Info': 'kidushishi-web-app'
    }
  }
});

// Export a function to get the storage key for other components
export const getAuthStorageKey = getStorageKey;

// Export a domain normalization function to help with URL redirection issues
export const getNormalizedDomain = () => {
  try {
    const hostname = window.location.hostname;
    
    // Local or development domains don't need www prefix
    if (hostname.startsWith('local') || 
        hostname.includes('localhost') || 
        hostname.includes('lovableproject.com')) {
      return hostname;
    }
    
    // Ensure we use www for the production domain to match SSL certificate
    if (hostname === 'kidushishi-menegment-app.co.il') {
      return 'www.kidushishi-menegment-app.co.il';
    }
    
    return hostname;
  } catch (e) {
    return '';
  }
};

// הוספת פונקציות עזר לניקוי אחסון ומידע של אימות
export const clearAuthStorage = () => {
  try {
    // Clear localStorage items related to auth
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('supabase.auth.') || key.includes(storageKey))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage items related to auth
    sessionStorage.removeItem('auth_redirect_count');
    sessionStorage.removeItem('auth_redirect_initiated');
    sessionStorage.removeItem('auth_redirect_time');
    sessionStorage.removeItem('auth_redirect_attempts');
    
    return true;
  } catch (error) {
    console.error("Error clearing auth storage:", error);
    return false;
  }
};
