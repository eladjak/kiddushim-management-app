
/**
 * Utility functions for handling encoding issues with non-Latin characters
 */

import { logger } from "@/utils/logger";
const log = logger.createLogger({ component: 'encodingUtils' });

/**
 * Safe version of btoa that handles UTF-8 characters properly
 * This avoids "InvalidCharacterError: Failed to execute 'btoa'"
 */
export function safeEncode(str: string): string {
  try {
    // Handle empty or null strings
    if (!str) return '';
    
    // Use TextEncoder for proper UTF-8 encoding
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    
    // Convert UTF-8 encoded array to binary string
    const binaryString = Array.from(data)
      .map(byte => String.fromCharCode(byte))
      .join('');
    
    // Encode as base64
    return btoa(binaryString);
  } catch (error) {
    // Log the error but provide fallback
    log.error('Error in safeEncode:', error);
    
    // Fallback to encodeURIComponent method
    try {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    } catch (backupError) {
      log.error('Backup encoding failed:', backupError);
      // Last resort - return URL encoded version
      return encodeURIComponent(str);
    }
  }
}

/**
 * Decode a safe-encoded string
 */
export function safeDecode(str: string): string {
  try {
    // Handle empty or null strings
    if (!str) return '';
    
    const binaryString = atob(str);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert back to UTF-8 string
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch (error) {
    log.error('Error in safeDecode:', error);
    
    // Fallback method
    try {
      return decodeURIComponent(
        Array.prototype.map
          .call(atob(str), (c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
    } catch (backupError) {
      log.error('Backup decoding failed:', backupError);
      // Return original string if all decoding fails
      return str;
    }
  }
}

/**
 * Check if a string contains non-Latin1 characters
 */
export function containsNonLatinChars(str: string): boolean {
  if (!str) return false;
  
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      return true;
    }
  }
  return false;
}

/**
 * Creates a base64 string that is URL safe and Hebrew-compatible
 * Used for PKCE and similar requirements
 */
export function generateSafePKCEString(length: number): string {
  try {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const charactersLength = characters.length;
    const randomValues = new Uint8Array(length);
    
    window.crypto.getRandomValues(randomValues);
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(randomValues[i] % charactersLength);
    }
    
    return result;
  } catch (error) {
    log.error('Error generating safe PKCE string:', error);
    
    // Fallback implementation
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  }
}

/**
 * Store the code verifier securely
 */
export function storeCodeVerifier(codeVerifier: string): void {
  try {
    localStorage.setItem('pkce_code_verifier', codeVerifier);
  } catch (e) {
    log.error('Failed to store code verifier in localStorage:', e);
  }
  
  try {
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  } catch (e) {
    log.error('Failed to store code verifier in sessionStorage:', e);
  }
}

/**
 * Retrieve the code verifier
 */
export function retrieveCodeVerifier(): string | null {
  try {
    // First attempt from localStorage
    const localVerifier = localStorage.getItem('pkce_code_verifier');
    if (localVerifier) {
      return localVerifier;
    }
    
    // Second attempt from sessionStorage
    const sessionVerifier = sessionStorage.getItem('pkce_code_verifier');
    if (sessionVerifier) {
      return sessionVerifier;
    }
    
    // Check legacy keys
    const legacyVerifier = localStorage.getItem('code_verifier') || 
                         sessionStorage.getItem('code_verifier') ||
                         localStorage.getItem('code-verifier') || 
                         sessionStorage.getItem('code-verifier');
    
    if (legacyVerifier) {
      return legacyVerifier;
    }
    
    return null;
  } catch (e) {
    log.error('Error retrieving code verifier:', e);
    return null;
  }
}
