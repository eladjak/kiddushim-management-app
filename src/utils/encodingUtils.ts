
import { logger } from './logger';
const log = logger.createLogger({ component: 'encodingUtils' });

/**
 * Creates a base64 string that is URL safe and Hebrew-compatible
 * This is a safer implementation for PKCE that handles Hebrew and special characters
 */
export function generateSafePKCEString(length: number): string {
  try {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const charactersLength = characters.length;
    let result = '';

    // Use crypto.getRandomValues if available for better randomness
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      result += characters.charAt(randomValues[i] % charactersLength);
    }

    return result;
  } catch (error) {
    log.error('Error generating safe PKCE string:', error);
    
    // Fallback to simpler implementation if crypto fails
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  }
}

/**
 * Safely store the code verifier in all available storage mechanisms
 * for redundancy in case one fails
 */
export function storeCodeVerifier(codeVerifier: string): void {
  try {
    localStorage.setItem('pkce_code_verifier', codeVerifier);
    log.info('Stored code verifier in localStorage');
  } catch (e) {
    log.error('Failed to store code verifier in localStorage:', e);
  }
  
  try {
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    log.info('Stored code verifier in sessionStorage');
  } catch (e) {
    log.error('Failed to store code verifier in sessionStorage:', e);
  }
}
