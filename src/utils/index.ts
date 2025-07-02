/**
 * Utility functions - centralized exports
 * 
 * This module provides a centralized export point for all utility functions.
 */

// Core utilities
export { cn } from '../lib/utils';
export { logger } from './logger';

// Encoding utilities
export { 
  generateSafePKCEString, 
  storeCodeVerifier, 
  safeEncode, 
  safeDecode,
  containsNonLatinChars,
  retrieveCodeVerifier
} from './encoding';

// RTL utilities
export { 
  isRtlLanguage, 
  rtlClass, 
  rtlPlaceholder, 
  getFlexDirection, 
  getTextAlignment, 
  rtlLayout, 
  fixRtlSpacing 
} from './rtl';

// Notification utilities
export { 
  createNotification, 
  getNotificationTypeIcon 
} from './notificationUtils';