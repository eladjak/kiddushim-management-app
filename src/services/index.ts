/**
 * Services - centralized exports
 * 
 * This module provides a centralized export point for all service modules.
 */

// Entity services
export { eventsService } from './entity/events';
export { usersService } from './entity/users';

// API client
export { 
  apiRequest, 
  get, 
  post, 
  put, 
  patch, 
  del,
  API_BASE_URL,
  defaultOptions 
} from './api/client';

// Supabase services
export { supabase } from './supabase/client';
export { authService } from './supabase/auth';
// Note: storage functions need to be implemented in supabase/storage.ts