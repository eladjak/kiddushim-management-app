
/**
 * טיפוסים עבור ישות משתמשים
 */
import type { AppRole } from './auth';

// סטטוס משתמש
export enum UserStatus {
  ACTIVE = 'active',       // פעיל
  INACTIVE = 'inactive',   // לא פעיל
  PENDING = 'pending',     // ממתין לאישור
  BLOCKED = 'blocked'      // חסום
}

// טיפוס בסיסי של משתמש
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: AppRole;
  status: UserStatus;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  last_login?: string;
  address?: string;
  birth_date?: string;
  notes?: string;
}

// פרופיל משתמש מורחב
export interface UserProfile extends User {
  bio?: string;
  preferences?: Record<string, unknown>;
  emergency_contact?: {
    name: string;
    phone: string;
    relation: string;
  };
  skills?: string[];
  availability?: {
    days: string[];
    times: string[];
  };
}

// טיפוס עבור יצירת משתמש
export type UserCreate = Omit<User, 'id' | 'created_at' | 'updated_at' | 'last_login'> & {
  password: string;
};

// טיפוס עבור עדכון משתמש
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at' | 'updated_at' | 'last_login'>>;

// פרטי הרשאות משתמש
export interface UserPermission {
  id: string;
  user_id: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  conditions?: Record<string, unknown>;
  created_at: string;
} 
