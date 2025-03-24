
/**
 * קבועים וטיפוסים עבור שירותי אימות
 */

/**
 * מפתחות Query עבור React Query
 */
export const AUTH_KEYS = {
  session: () => ['auth', 'session'] as const,
  user: () => ['auth', 'user'] as const,
  profile: (id: string) => ['auth', 'profile', id] as const,
};
