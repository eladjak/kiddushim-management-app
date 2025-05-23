
/**
 * Utility functions for handling encoding issues with non-Latin characters
 */

/**
 * Safe version of btoa that handles UTF-8 characters properly
 * This avoids "InvalidCharacterError: Failed to execute 'btoa'"
 */
export function safeEncode(str: string): string {
  // First we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent-encodings into raw bytes,
  // and finally feed it to btoa() for base64-encoding
  return btoa(
    encodeURIComponent(str).replace(
      /%([0-9A-F]{2})/g,
      (_, p1) => String.fromCharCode(parseInt(p1, 16))
    )
  );
}

/**
 * Decode a safe-encoded string
 */
export function safeDecode(str: string): string {
  // Going backwards: from base64-encoded to percent-encoded UTF-8, then to UTF-8 string
  return decodeURIComponent(
    atob(str)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

/**
 * Check if a string contains non-Latin1 characters
 */
export function containsNonLatinChars(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      return true;
    }
  }
  return false;
}
