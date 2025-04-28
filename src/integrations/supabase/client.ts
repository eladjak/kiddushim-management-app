
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // קביעת סוג הזרימה במפורש
  },
});

/**
 * מקבל מפתח לאחסון מידע בלוקל סטורג'
 */
export function getAuthStorageKey() {
  return `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
}

/**
 * Clear all authentication related storage
 */
export function clearAuthStorage() {
  try {
    // Clear all localStorage items related to auth
    localStorage.removeItem('supabase-code-verifier');
    localStorage.removeItem('code-verifier-timestamp');
    localStorage.removeItem('auth_redirect_initiated');
    localStorage.removeItem('auth_redirect_time');
    localStorage.removeItem('auth_redirect_count');
    localStorage.removeItem('auth_provider');
    
    // Clear all sessionStorage items related to auth
    sessionStorage.removeItem('supabase-code-verifier');
    sessionStorage.removeItem('auth_redirect_initiated');
    sessionStorage.removeItem('auth_redirect_time');
    sessionStorage.removeItem('auth_redirect_count');
    sessionStorage.removeItem('auth_provider');

    // Clear Supabase auth storage - using signOut instead
    supabase.auth.signOut({ scope: 'local' })
      .then(() => console.log('Supabase auth state cleared'))
      .catch(err => console.error('Error clearing Supabase auth state:', err));
    
    console.log('All auth storage cleared');
  } catch (err) {
    console.error('Error clearing auth storage:', err);
  }
}

/**
 * Get domain name with www prefix if needed
 */
export function getNormalizedDomain() {
  const hostname = window.location.hostname;
  
  // If we're on localhost or already on www, use the current hostname
  if (hostname === 'localhost' || hostname.startsWith('www.')) {
    return hostname;
  }
  
  // Add www prefix for production domain to match SSL certificate
  if (hostname === 'kidushishi-menegment-app.co.il') {
    return 'www.kidushishi-menegment-app.co.il';
  }
  
  // Default to current hostname if not matching known patterns
  return hostname;
}

/**
 * Configure auth provider settings
 */
export function configureAuthProvider(provider: string) {
  // Set up provider-specific configurations here if needed in the future
  console.log(`Configuring auth provider: ${provider}`);
}
