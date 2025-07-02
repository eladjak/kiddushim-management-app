/**
 * Auth callback utilities - centralized exports
 * 
 * This module provides a centralized export point for all auth callback related utilities.
 * It helps reduce the number of individual imports across the codebase.
 */

// Main hooks
export { useAuthCallback } from './useAuthCallback';
export { useAuthCallbackFlow } from './useAuthCallbackFlow';
export { useAuthCallbackState } from './useAuthCallbackState';
export { useCallbackCleanup } from './useCallbackCleanup';
export { useSafetyTimeout } from './useSafetyTimeout';
export { useUrlCleanup } from './useUrlCleanup';

// Utility functions
export { checkExistingSession } from './checkExistingSession';
export { extractAccessToken } from './extractAccessToken';
export { handleAuthCode } from './handleAuthCode';
export { handleAuthFailure } from './handleAuthFailure';
export { handleExistingSession } from './handleExistingSession';
export { handleImplicitAuth } from './handleImplicitAuth';
export { handlePkceError } from './handlePkceError';
export { handleUrlCode } from './handleUrlCode';
export { processAccessToken } from './processAccessToken';
export { processAuthCodes } from './processAuthCodes';
export { processCallback } from './processCallback';
export { showToast } from './toastHelpers';

// Types
export type { 
  ToastType, 
  AuthCallbackContext, 
  AuthProcessResult 
} from './types';