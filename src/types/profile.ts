
export type { AppRole } from './auth';
export type { Profile as UserProfile } from './auth';

// Backwards compatibility alias
export type RoleType = import('./auth').AppRole;
export type UserRole = import('./auth').AppRole;
