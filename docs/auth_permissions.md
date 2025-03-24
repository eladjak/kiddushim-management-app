# מערכת אימות והרשאות

## סקירת המצב הנוכחי

המערכת הנוכחית משתמשת ב-Supabase Auth כמנגנון האימות המרכזי, עם המאפיינים הבאים:
1. **שירותי אימות**: כניסה באמצעות אימייל/סיסמה וגוגל
2. **ניהול סשן**: Supabase מנהל את ה-JWT token והסשן
3. **פרופילים**: טבלת `profiles` המקושרת למשתמשים מאומתים
4. **תפקידים**: שדה `role` בטבלת `profiles` המגדיר את תפקיד המשתמש
5. **הרשאות**: מבוססות בעיקר על בדיקות בצד הלקוח לפי התפקיד

מספר אתגרים קיימים במערכת הנוכחית:
- אין מנגנון הרשאות גרנולרי
- אין הפרדה ברורה בין אימות וניהול משתמשים
- אין תמיכה טובה במצבי שגיאות בתהליך האימות
- אין מנגנון לניהול סשן פג תוקף או התנתקות אוטומטית

## ארכיטקטורת האימות וההרשאות המוצעת

### 1. מערכת אימות מתקדמת

נמשיך להשתמש ב-Supabase Auth, אך עם שיפורים משמעותיים:

#### 1.1 שכבת אבסטרקציה לשירותי אימות

```typescript
// src/services/auth/auth-service.ts
import { supabase } from '../supabase/client';
import type { Provider } from '@supabase/supabase-js';
import type { Profile } from '@/types/auth';

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: Profile;
  session?: any;
}

export const authService = {
  /**
   * התחברות עם אימייל וסיסמה
   */
  async loginWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      return {
        success: false,
        error: translateAuthError(error.message),
      };
    }
  },

  /**
   * התחברות עם ספק חיצוני (Google, Facebook, וכו')
   */
  async loginWithProvider(provider: Provider): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: translateAuthError(error.message),
      };
    }
  },

  /**
   * הרשמה עם אימייל וסיסמה
   */
  async registerWithEmail(email: string, password: string, userData: Partial<Profile>): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'youth_volunteer', // ברירת מחדל היא מתנדב נוער
          }
        }
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      return {
        success: false,
        error: translateAuthError(error.message),
      };
    }
  },

  /**
   * איפוס סיסמה
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: translateAuthError(error.message),
      };
    }
  },

  /**
   * עדכון סיסמה
   */
  async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: translateAuthError(error.message),
      };
    }
  },

  /**
   * התנתקות
   */
  async logout(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: translateAuthError(error.message),
      };
    }
  },

  /**
   * קבלת המשתמש הנוכחי
   */
  async getCurrentUser(): Promise<Profile | null> {
    try {
      const { data } = await supabase.auth.getUser();
      
      if (!data.user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return profile;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * קבלת סשן האימות הנוכחי
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      return data.session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }
};

/**
 * תרגום הודעות שגיאה לעברית
 */
function translateAuthError(errorMessage: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'פרטי התחברות שגויים',
    'Email not confirmed': 'כתובת האימייל לא אומתה',
    'User already registered': 'משתמש זה כבר רשום במערכת',
    'Invalid email': 'כתובת אימייל לא חוקית',
    'Password should be at least 6 characters': 'הסיסמה חייבת להכיל לפחות 6 תווים',
    // הוסף עוד תרגומים לפי הצורך
  };

  return errorMap[errorMessage] || 'אירעה שגיאה. אנא נסה שוב מאוחר יותר.';
}
```

#### 1.2 קונטקסט אימות משופר

```typescript
// src/context/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services/auth/auth-service';
import type { Profile, Provider } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  loginWithProvider: (provider: Provider) => Promise<boolean>;
  register: (email: string, password: string, userData: Partial<Profile>) => Promise<boolean>;
  logout: () => Promise<boolean>;
  updateProfile: (data: Partial<Profile>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  loginWithEmail: async () => false,
  loginWithProvider: async () => false,
  register: async () => false,
  logout: async () => false,
  updateProfile: async () => false,
  resetPassword: async () => false,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // בדיקה ראשונית של משתמש מחובר
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // האזנה לשינויים בסשן
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    const result = await authService.loginWithEmail(email, password);
    setIsLoading(false);

    if (!result.success) {
      toast({
        title: 'שגיאת התחברות',
        description: result.error,
        variant: 'destructive',
      });
      return false;
    }

    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    return true;
  };

  const loginWithProvider = async (provider: Provider) => {
    return await authService.loginWithProvider(provider).then(result => result.success);
  };

  const register = async (email: string, password: string, userData: Partial<Profile>) => {
    setIsLoading(true);
    const result = await authService.registerWithEmail(email, password, userData);
    setIsLoading(false);

    if (!result.success) {
      toast({
        title: 'שגיאה בהרשמה',
        description: result.error,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'ההרשמה הושלמה בהצלחה',
      description: 'ברוך הבא למערכת!',
    });

    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    return true;
  };

  const logout = async () => {
    setIsLoading(true);
    const result = await authService.logout();
    setIsLoading(false);

    if (!result.success) {
      toast({
        title: 'שגיאת התנתקות',
        description: result.error,
        variant: 'destructive',
      });
      return false;
    }

    setUser(null);
    return true;
  };

  const updateProfile = async (data: Partial<Profile>) => {
    // טיפול בעדכון פרטי פרופיל
    // ...
    return true;
  };

  const resetPassword = async (email: string) => {
    const result = await authService.resetPassword(email);
    
    if (!result.success) {
      toast({
        title: 'שגיאה באיפוס סיסמה',
        description: result.error,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'בקשת איפוס סיסמה נשלחה בהצלחה',
      description: 'בדוק את תיבת הדואר האלקטרוני שלך לקבלת הוראות המשך',
    });
    
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        loginWithEmail,
        loginWithProvider,
        register,
        logout,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 2. מערכת הרשאות RBAC (Role-Based Access Control)

נשפר את מנגנון ההרשאות ליצירת שכבה מאובטחת יותר:

#### 2.1 הגדרת מודל הרשאות

```typescript
// src/lib/permissions/types.ts
import type { RoleType } from '@/types/profile';

export type PermissionAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'approve'
  | 'assign';

export type PermissionResource = 
  | 'events' 
  | 'users' 
  | 'equipment' 
  | 'reports' 
  | 'feedback'
  | 'all';

export interface Permission {
  action: PermissionAction;
  resource: PermissionResource;
  conditions?: Record<string, any>;
}

export type PermissionSet = Permission[];

export type RolePermissions = Record<RoleType, PermissionSet>;
```

#### 2.2 הגדרת הרשאות לכל תפקיד

```typescript
// src/lib/permissions/permissions-map.ts
import type { RolePermissions } from './types';

// מפת הרשאות לכל תפקיד
export const rolePermissions: RolePermissions = {
  // מנהל מערכת - הרשאות מלאות
  admin: [
    { action: 'manage', resource: 'all' },
  ],

  // רכז - ניהול רוב המשאבים, ללא הרשאות מנהל מלאות
  coordinator: [
    // אירועים
    { action: 'create', resource: 'events' },
    { action: 'read', resource: 'events' },
    { action: 'update', resource: 'events' },
    { action: 'delete', resource: 'events' },
    { action: 'assign', resource: 'events' },
    
    // משתמשים
    { action: 'read', resource: 'users' },
    { action: 'update', resource: 'users', conditions: { role: ['youth_volunteer', 'service_girl'] } },
    
    // ציוד
    { action: 'create', resource: 'equipment' },
    { action: 'read', resource: 'equipment' },
    { action: 'update', resource: 'equipment' },
    { action: 'approve', resource: 'equipment' },
    
    // דיווחים
    { action: 'create', resource: 'reports' },
    { action: 'read', resource: 'reports' },
    { action: 'update', resource: 'reports' },
    
    // משובים
    { action: 'read', resource: 'feedback' },
  ],

  // בת שירות - הרשאות בסיסיות לניהול אירועים וציוד
  service_girl: [
    // אירועים
    { action: 'read', resource: 'events' },
    { action: 'create', resource: 'events', conditions: { draft: true } },
    { action: 'update', resource: 'events', conditions: { created_by: 'self' } },
    
    // ציוד
    { action: 'read', resource: 'equipment' },
    { action: 'create', resource: 'equipment', conditions: { pending_approval: true } },
    
    // דיווחים
    { action: 'create', resource: 'reports' },
    { action: 'read', resource: 'reports', conditions: { reporter_id: 'self' } },
    
    // משובים
    { action: 'create', resource: 'feedback' },
  ],

  // מתנדב נוער - הרשאות בסיסיות לקריאה והשתתפות
  youth_volunteer: [
    // אירועים
    { action: 'read', resource: 'events' },
    
    // ציוד
    { action: 'read', resource: 'equipment' },
    
    // דיווחים
    { action: 'create', resource: 'reports', conditions: { type: 'event_feedback' } },
    { action: 'read', resource: 'reports', conditions: { reporter_id: 'self' } },
    
    // משובים
    { action: 'create', resource: 'feedback' },
  ],

  // ספק תוכן - הרשאות ייחודיות לניהול תוכן
  content_provider: [
    // אירועים
    { action: 'read', resource: 'events' },
    
    // דיווחים
    { action: 'create', resource: 'reports', conditions: { type: 'content' } },
    { action: 'read', resource: 'reports', conditions: { reporter_id: 'self' } },
    { action: 'update', resource: 'reports', conditions: { reporter_id: 'self', type: 'content' } },
  ],
};
```

#### 2.3 בדיקת הרשאות

```typescript
// src/lib/permissions/utils.ts
import { rolePermissions } from './permissions-map';
import type { Permission, PermissionAction, PermissionResource } from './types';
import type { Profile } from '@/types/auth';

/**
 * בדיקה האם למשתמש יש הרשאה לבצע פעולה מסוימת על משאב
 * 
 * @param user המשתמש שעבורו בודקים את ההרשאה
 * @param action הפעולה שרוצים לבצע
 * @param resource המשאב שרוצים לגשת אליו
 * @param context מידע נוסף רלוונטי לבדיקת ההרשאה (למשל האם זה המשאב של המשתמש)
 */
export function hasPermission(
  user: Profile | null,
  action: PermissionAction,
  resource: PermissionResource,
  context: Record<string, any> = {}
): boolean {
  // אם אין משתמש, אין הרשאות
  if (!user) return false;

  // קבלת ההרשאות לתפקיד המשתמש
  const permissions = rolePermissions[user.role];
  if (!permissions) return false;

  // בדיקה האם יש הרשאה כללית לכל המשאבים
  const hasAllResourcesPermission = permissions.some(
    (p) => p.action === action && p.resource === 'all'
  );
  if (hasAllResourcesPermission) return true;

  // בדיקה האם יש הרשאה כללית לניהול כל המשאבים
  const hasManageAllPermission = permissions.some(
    (p) => p.action === 'manage' && p.resource === 'all'
  );
  if (hasManageAllPermission) return true;

  // בדיקה האם יש הרשאה כללית לניהול המשאב הספציפי
  const hasManageResourcePermission = permissions.some(
    (p) => p.action === 'manage' && p.resource === resource
  );
  if (hasManageResourcePermission) return true;

  // בדיקת הרשאה ספציפית
  return permissions.some((p) => {
    // הרשאה מתאימה לפעולה ולמשאב
    if (p.action === action && p.resource === resource) {
      // אם אין תנאים, ההרשאה תקפה
      if (!p.conditions) return true;

      // בדיקת תנאים
      return Object.entries(p.conditions).every(([key, value]) => {
        // תנאי 'self' - המשאב שייך למשתמש עצמו
        if (value === 'self') {
          return context[key] === user.id;
        }
        
        // תנאי מערך - ערך נמצא ברשימת ערכים מותרים
        if (Array.isArray(value)) {
          return value.includes(context[key]);
        }
        
        // תנאי פשוט - ערך תואם בדיוק
        return context[key] === value;
      });
    }
    return false;
  });
}

/**
 * הוק שימושי לבדיקת הרשאות בקומפוננטות
 */
export function usePermission() {
  const { user } = useAuth();

  return {
    can: (action: PermissionAction, resource: PermissionResource, context?: Record<string, any>) =>
      hasPermission(user, action, resource, context),
  };
}
```

#### 2.4 קומפוננטות עטיפה להגנה על תוכן

```tsx
// src/components/auth/RequireAuth.tsx
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
  fallbackPath?: string;
}

/**
 * קומפוננטה המגנה על תוכן שדורש אימות
 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  fallbackPath = '/auth/login'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // מצב טעינה - לא מציגים כלום בינתיים
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">טוען...</div>;
  }

  // אם המשתמש לא מאומת, העבר אותו לדף הכניסה
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // המשתמש מאומת, הצג את התוכן
  return <>{children}</>;
};
```

```tsx
// src/components/auth/RequirePermission.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from '@/lib/permissions/utils';
import type { PermissionAction, PermissionResource } from '@/lib/permissions/types';

interface RequirePermissionProps {
  children: ReactNode;
  action: PermissionAction;
  resource: PermissionResource;
  context?: Record<string, any>;
  fallback?: ReactNode;
}

/**
 * קומפוננטה המגנה על תוכן שדורש הרשאה ספציפית
 */
export const RequirePermission: React.FC<RequirePermissionProps> = ({
  children,
  action,
  resource,
  context,
  fallback = <Navigate to="/" replace />
}) => {
  const { can } = usePermission();
  
  // בדיקה האם למשתמש יש הרשאה
  const hasPermission = can(action, resource, context);
  
  // אם יש למשתמש הרשאה, הצג את התוכן
  if (hasPermission) {
    return <>{children}</>;
  }
  
  // אם אין הרשאה, הצג את תוכן הגיבוי
  return <>{fallback}</>;
};
```

### 3. שימוש במערכת ההרשאות בניתוב

```tsx
// src/App.tsx (חלק מהגדרות הניתוב)
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequirePermission } from '@/components/auth/RequirePermission';

function AppRoutes() {
  return (
    <Routes>
      {/* דפים ציבוריים */}
      <Route path="/" element={<IndexLayout><Index /></IndexLayout>} />
      <Route path="/auth/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/auth/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/auth/callback" element={<PublicLayout><AuthCallback /></PublicLayout>} />
      <Route path="/auth/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />
      
      {/* דפים מוגנים - דורשים אימות */}
      <Route path="/profile" element={
        <RequireAuth>
          <AuthenticatedLayout>
            <UserProfile />
          </AuthenticatedLayout>
        </RequireAuth>
      } />
      
      {/* דפי אירועים - שונים לפי הרשאות */}
      <Route path="/events" element={
        <RequireAuth>
          <AuthenticatedLayout>
            <Events />
          </AuthenticatedLayout>
        </RequireAuth>
      } />
      
      <Route path="/events/create" element={
        <RequireAuth>
          <RequirePermission action="create" resource="events">
            <AuthenticatedLayout>
              <CreateEvent />
            </AuthenticatedLayout>
          </RequirePermission>
        </RequireAuth>
      } />
      
      {/* דפי ניהול משתמשים - למנהלים ורכזים בלבד */}
      <Route path="/users" element={
        <RequireAuth>
          <RequirePermission action="read" resource="users">
            <AuthenticatedLayout>
              <Users />
            </AuthenticatedLayout>
          </RequirePermission>
        </RequireAuth>
      } />
      
      {/* ניהול ציוד - לבעלי הרשאה בלבד */}
      <Route path="/equipment" element={
        <RequireAuth>
          <AuthenticatedLayout>
            <Equipment />
          </AuthenticatedLayout>
        </RequireAuth>
      } />
      
      <Route path="/equipment/manage" element={
        <RequireAuth>
          <RequirePermission action="manage" resource="equipment">
            <AuthenticatedLayout>
              <ManageEquipment />
            </AuthenticatedLayout>
          </RequirePermission>
        </RequireAuth>
      } />
      
      {/* דף שגיאה (404) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

### 4. שימוש בהרשאות בקומפוננטות

```tsx
// src/components/events/EventActions.tsx
import { usePermission } from '@/lib/permissions/utils';
import { Button } from '@/components/ui/button';
import type { Event } from '@/types/events';

interface EventActionsProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
}

export const EventActions: React.FC<EventActionsProps> = ({ event, onEdit, onDelete }) => {
  const { can } = usePermission();
  
  // בדיקה האם למשתמש יש הרשאה לעריכת האירוע
  const canEditEvent = can('update', 'events', { 
    created_by: event.created_by,
    // שדות הקשר נוספים אם נדרש
  });
  
  // בדיקה האם למשתמש יש הרשאה למחיקת האירוע
  const canDeleteEvent = can('delete', 'events');
  
  return (
    <div className="flex space-x-2 space-x-reverse">
      {canEditEvent && (
        <Button size="sm" onClick={onEdit}>
          ערוך
        </Button>
      )}
      
      {canDeleteEvent && (
        <Button size="sm" variant="destructive" onClick={onDelete}>
          מחק
        </Button>
      )}
    </div>
  );
};
```

## RLS (Row Level Security) ב-Supabase

הפתרון המוצע משלב גם אבטחה בצד השרת באמצעות RLS ב-Supabase:

### 1. הגדרת מדיניות RLS לטבלת אירועים

```sql
-- הרשאות קריאה: כל משתמש מאומת יכול לקרוא אירועים
CREATE POLICY "Enable read access for authenticated users" ON "public"."events"
FOR SELECT USING (auth.uid() IS NOT NULL);

-- הרשאות יצירה: כל משתמש מאומת יכול ליצור אירוע
CREATE POLICY "Enable insert access for authenticated users" ON "public"."events"
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- הרשאות עדכון: 
-- 1. מנהלים ורכזים יכולים לעדכן כל אירוע
-- 2. יתר המשתמשים יכולים לעדכן רק אירועים שהם יצרו
CREATE POLICY "Enable update for admins and coordinators" ON "public"."events"
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'coordinator')
  )
);

CREATE POLICY "Enable update for event creators" ON "public"."events"
FOR UPDATE USING (
  created_by = auth.uid()
);

-- הרשאות מחיקה: רק מנהלים ורכזים יכולים למחוק אירועים
CREATE POLICY "Enable delete for admins and coordinators" ON "public"."events"
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'coordinator')
  )
);
```

### 2. הנחיות להגדרת RLS נוספות

עבור כל טבלה במסד הנתונים יש לקבוע מדיניות RLS תואמת למדיניות ההרשאות המוגדרת במערכת. עקרונות מרכזיים להגדרת RLS:

1. **הרשאות קריאה בסיסיות** - לרוב משתמשים מאומתים יכולים לקרוא נתונים בסיסיים
2. **הרשאות עדכון** - על פי תפקיד והקשר (בעלים של הרשומה, תפקיד מתאים וכו')
3. **הרשאות מחיקה** - בד"כ מוגבלות לתפקידים בכירים
4. **קביעת תנאים** - שימוש בתנאים מורכבים המבוססים על מצב המשתמש, הרשומה וההקשר

## סיכום והמלצות ליישום

### יתרונות המערכת המוצעת

1. **אבטחה שכבתית** - מערכת הרשאות עם בדיקות בצד הלקוח ובצד השרת
2. **גמישות** - הגדרות הרשאות מרכזיות ניתנות להרחבה בקלות
3. **חווית משתמש משופרת** - משוב ברור יותר למשתמש לגבי הרשאות וגישה
4. **תחזוקתיות** - קל יותר לעדכן ולשנות הרשאות

### שלבי יישום

1. **הגדרת מבנה נתונים** - הרחבת טבלת הפרופילים ומבנה ההרשאות
2. **יצירת שכבת שירותי אימות** - התאמת שירותי האימות למבנה החדש
3. **יישום קונטקסט אימות** - עדכון/החלפת קונטקסט אימות נוכחי
4. **הטמעת מנגנון הרשאות** - הוספת בדיקות הרשאות בקומפוננטות ובניתוב
5. **הגדרת RLS** - הגדרה או עדכון מדיניות RLS בטבלאות Supabase

### שיקולים נוספים

1. **ביצועים** - מטמון של הרשאות משתמש להפחתת בדיקות מיותרות
2. **גיבוי ושחזור** - מנגנון לגיבוי הגדרות הרשאות והחזרת משתמשים שאיבדו גישה
3. **לוגים** - תיעוד של פעולות רגישות והענקת/שלילת הרשאות
4. **תמיכה בהרשאות דינמיות** - אופציה להרשאות זמניות או מבוססות הקשר ספציפי 