
import { QueryClient } from '@tanstack/react-query';

/**
 * Global Query Client configuration
 * 
 * defaultOptions:
 * - refetchOnWindowFocus: false - Don't refetch when window focuses
 * - retry: 1 - Only retry failed requests once
 * - staleTime: 5 minutes - Consider data fresh for 5 minutes
 * - gcTime: 10 minutes - Keep unused data in cache for 10 minutes (formerly cacheTime)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000 // 10 minutes
    },
  },
}); 
