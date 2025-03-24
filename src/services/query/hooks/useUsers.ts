import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/entity/users';
import type { User, UserCreate, UserUpdate, UserProfile } from '@/types/users';
import { toast } from '@/components/ui/use-toast';

// קבועים לשימוש כמפתחות query
export const USERS_KEYS = {
  all: ['users'] as const,
  lists: () => [...USERS_KEYS.all, 'list'] as const,
  list: (filters: string) => [...USERS_KEYS.lists(), { filters }] as const,
  search: (query: string) => [...USERS_KEYS.lists(), { search: query }] as const,
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
    onError: (error: Error) => {
      console.error('Error fetching users:', error);
      toast({
        title: 'שגיאה בטעינת משתמשים',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * הוק לחיפוש משתמשים
 */
export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: USERS_KEYS.search(query),
    queryFn: () => usersService.search(query),
    enabled: query.length > 2, // רק אם הוזנו לפחות 3 תווים
    onError: (error: Error) => {
      console.error('Error searching users:', error);
      toast({
        title: 'שגיאה בחיפוש משתמשים',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * הוק לקבלת משתמש ספציפי
 */
export const useUser = (id?: string) => {
  return useQuery({
    queryKey: USERS_KEYS.detail(id || ''),
    queryFn: () => usersService.getById(id!),
    enabled: !!id,
    onError: (error: Error) => {
      console.error(`Error fetching user ${id}:`, error);
      toast({
        title: 'שגיאה בטעינת פרטי משתמש',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * הוק לקבלת פרופיל משתמש
 */
export const useUserProfile = (id?: string) => {
  return useQuery({
    queryKey: USERS_KEYS.profile(id || ''),
    queryFn: () => usersService.getProfile(id!),
    enabled: !!id,
    onError: (error: Error) => {
      console.error(`Error fetching user profile ${id}:`, error);
      toast({
        title: 'שגיאה בטעינת פרופיל משתמש',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * הוק ליצירת משתמש חדש
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: UserCreate) => usersService.create(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      toast({
        title: 'משתמש נוצר בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error creating user:', error);
      toast({
        title: 'שגיאה ביצירת משתמש',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * הוק לעדכון משתמש
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdate }) => 
      usersService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      toast({
        title: 'פרטי משתמש עודכנו בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating user:', error);
      toast({
        title: 'שגיאה בעדכון פרטי משתמש',
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
    mutationFn: ({ id, data }: { id: string; data: Partial<UserProfile> }) => 
      usersService.updateProfile(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.profile(variables.id) });
      toast({
        title: 'פרופיל משתמש עודכן בהצלחה',
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
 * הוק למחיקת משתמש
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      queryClient.removeQueries({ queryKey: USERS_KEYS.detail(id) });
      queryClient.removeQueries({ queryKey: USERS_KEYS.profile(id) });
      toast({
        title: 'משתמש נמחק בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting user:', error);
      toast({
        title: 'שגיאה במחיקת משתמש',
        description: error.message,
        variant: 'destructive',
 