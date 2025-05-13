
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uqumzjmyejlhoyliyesu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdW16am15ZWpsaG95bGl5ZXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwODA1MDIsImV4cCI6MjA1NDY1NjUwMn0.btzU9O72DPhxW_gm_G_AKPOaVBuKI8F4KSrnhdNmRO8';
const log = logger.createLogger({ component: 'SupabaseClient' });

// Log configuration
log.info('Initializing Supabase client with config', { 
  url: supabaseUrl, 
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0 
});

// Create the Supabase client with proper auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
});

/**
 * Configure the auth provider for login
 */
export function configureAuthProvider(provider: string) {
  // Provider-specific configuration if needed
  log.info(`Configuring auth provider: ${provider}`);
}

/**
 * Get a normalized domain name for redirects
 * Add www. prefix if needed based on environment
 */
export function getNormalizedDomain(): string {
  const hostname = window.location.hostname;
  
  // Add www. prefix for production domains if not present
  if (hostname.includes('kidushishi-menegment-app.co.il') && !hostname.startsWith('www.')) {
    return `www.${hostname}`;
  }
  
  return hostname;
}

/**
 * Clear all auth storage to handle potential auth issues
 */
export function clearAuthStorage() {
  try {
    // Clear local storage auth data
    localStorage.removeItem('sb-uqumzjmyejlhoyliyesu-auth-token');
    sessionStorage.removeItem('sb-uqumzjmyejlhoyliyesu-auth-token');
    
    // Clear other auth-related items
    localStorage.removeItem('auth_redirect_initiated');
    localStorage.removeItem('auth_redirect_time');
    localStorage.removeItem('auth_provider');
    localStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('pkce_code_verifier');
    
    log.info('Auth storage cleared successfully');
    return true;
  } catch (error) {
    log.error('Error clearing auth storage:', error);
    return false;
  }
}

/**
 * Log auth diagnostics for debugging
 */
export function logAuthDiagnostics() {
  const diagnostics = {
    hasLocalAuthToken: !!localStorage.getItem('sb-uqumzjmyejlhoyliyesu-auth-token'),
    hasSessionAuthToken: !!sessionStorage.getItem('sb-uqumzjmyejlhoyliyesu-auth-token'),
    hasRedirectInitiated: !!localStorage.getItem('auth_redirect_initiated'),
    hasRedirectTime: !!localStorage.getItem('auth_redirect_time'),
    redirectTime: localStorage.getItem('auth_redirect_time'),
    authProvider: localStorage.getItem('auth_provider'),
    hasPkceVerifierLocal: !!localStorage.getItem('pkce_code_verifier'),
    hasPkceVerifierSession: !!sessionStorage.getItem('pkce_code_verifier'),
    timestamp: new Date().toISOString()
  };
  
  log.info('Auth diagnostics:', diagnostics);
  return diagnostics;
}

// Exporting a default for backward compatibility
export default supabase;
