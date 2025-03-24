
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/entity/users';
import type { User, UserRole } from '@/types/users';
import type { UserProfile } from '@/types/profile';
import { toast } from '@/components/ui/use-toast';

// קבועים לשימוש כמפתחות query
export const USERS_KEYS = {
  all: ['users'] as const,
  lists: () => [...USERS_KEYS.all, 'list'] as const,
  list: (filters: string) => [...USERS_KEYS.lists(), { filters }] as const,
  search: (search: string) => [...USERS_KEYS.lists(), { search }] as const,
  details: () => [...USERS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USERS_KEYS.details(), id] as const,
  profile: (id: string) => [...USERS_KEYS.detail(id), 'profile'] as const,
};

/**
 * הוק לקבלת כל המשתמשים
 */
export const useUsers = (filters = '') => {
  return useQuery({
    queryKey: USERS_KEYS.list(filters),
    queryFn: () => usersService.getAll(),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching users:', error);
        toast({
          title: 'שגיאה בטעינת משתמשים',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  });
};

/**
 * הוק לחיפוש משתמשים
 */
export const useSearchUsers = (search: string) => {
  return useQuery({
    queryKey: USERS_KEYS.search(search),
    queryFn: () => usersService.search(search),
    enabled: search.length > 2,
    meta: {
      onError: (error: Error) => {
        console.error('Error searching users:', error);
        toast({
          title: 'שגיאה בחיפוש משתמשים',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  });
};

/**
 * הוק לקבלת משתמש ספציפי
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: USERS_KEYS.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: !!id,
    meta: {
      onError: (error: Error) => {
        console.error(`Error fetching user ${id}:`, error);
        toast({
          title: 'שגיאה בטעינת פרטי משתמש',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  });
};

/**
 * הוק לקבלת פרופיל משתמש
 */
export const useUserProfile = (id: string) => {
  return useQuery({
    queryKey: USERS_KEYS.profile(id),
    queryFn: () => usersService.getProfile(id),
    enabled: !!id,
    meta: {
      onError: (error: Error) => {
        console.error(`Error fetching profile for user ${id}:`, error);
        toast({
          title: 'שגיאה בטעינת פרופיל משתמש',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  });
};

/**
 * הוק לעדכון תפקיד משתמש
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => 
      usersService.updateRole(userId, role),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.detail(userId) });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.profile(userId) });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      toast({
        title: 'תפקיד המשתמש עודכן בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating user role:', error);
      toast({
        title: 'שגיאה בעדכון תפקיד משתמש',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * הוק לעדכון פרופיל משתמש
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<UserProfile> }) => 
      usersService.updateProfile(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.detail(userId) });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.profile(userId) });
      toast({
        title: 'פרופיל המשתמש עודכן בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating user profile:', error);
      toast({
        title: 'שגיאה בעדכון פרופיל משתמש',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * הוק להפיכת משתמש למנהל
 */
export const usePromoteToAdmin = () => {
  const updateUserRole = useUpdateUserRole();
  
  return {
    mutate: (userId: string) => updateUserRole.mutate({ userId, role: 'admin' }),
    isLoading: updateUserRole.isPending
  };
};

/**
 * הוק להורדת הרשאות מנהל
 */
export const useDemoteFromAdmin = () => {
  const updateUserRole = useUpdateUserRole();
  
  return {
    mutate: (userId: string) => updateUserRole.mutate({ userId, role: 'coordinator' }),
    isLoading: updateUserRole.isPending
  };
};
