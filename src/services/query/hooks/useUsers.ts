
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/entity/users';
import { toast } from '@/components/ui/use-toast';
import type { User, UserCreate, UserUpdate } from '@/types/users';
import type { UserProfile, RoleType } from '@/types/profile';
import { logger } from '@/utils/logger';

const log = logger.createLogger({ component: 'useUsers' });

const USERS_KEYS = {
  all: () => ['users'] as const,
  lists: () => ['users', 'list'] as const,
  list: (filters: string) => ['users', 'list', { filters }] as const,
  details: () => ['users', 'detail'] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
  profiles: () => ['users', 'profile'] as const,
  profile: (id: string) => ['users', 'profile', id] as const,
};

/**
 * Hook לקבלת רשימת משתמשים
 */
export const useUsers = (filters?: string) => {
  const queryKey = filters
    ? USERS_KEYS.list(filters)
    : USERS_KEYS.lists();

  return useQuery({
    queryKey,
    queryFn: usersService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) => {
        log.error('Error fetching users', { error });
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
 * Hook לקבלת פרטי משתמש
 */
export const useUser = (id?: string) => {
  return useQuery({
    queryKey: USERS_KEYS.detail(id || ''),
    queryFn: () => usersService.getById(id!),
    enabled: !!id,
    meta: {
      onError: (error: Error) => {
        log.error(`Error fetching user ${id}`, { error });
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
 * Hook לקבלת פרופיל משתמש
 */
export const useUserProfile = (id?: string) => {
  return useQuery({
    queryKey: USERS_KEYS.profile(id || ''),
    queryFn: () => usersService.getProfile(id!),
    enabled: !!id,
    meta: {
      onError: (error: Error) => {
        log.error(`Error fetching user profile ${id}`, { error });
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
 * Hook ליצירת משתמש חדש
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: UserCreate) => usersService.create(userData),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });

      toast({
        title: 'משתמש נוצר בהצלחה',
        description: `משתמש ${newUser.email} נוצר בהצלחה`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה ביצירת משתמש',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * Hook לעדכון משתמש קיים
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UserUpdate }) =>
      usersService.update(id, userData),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.detail(updatedUser.id) });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });

      toast({
        title: 'משתמש עודכן בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בעדכון משתמש',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * Hook לעדכון פרופיל משתמש
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, profileData }: { id: string; profileData: Partial<UserProfile> }) =>
      usersService.updateProfile(id, profileData),
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.profile(updatedProfile.id) });

      toast({
        title: 'פרופיל עודכן בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בעדכון פרופיל',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * Hook לעדכון תפקיד משתמש
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: RoleType }) =>
      usersService.updateRole(id, role),
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.profile(updatedProfile.id) });

      toast({
        title: 'תפקיד משתמש עודכן בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בעדכון תפקיד משתמש',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * Hook למחיקת משתמש
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      queryClient.removeQueries({ queryKey: USERS_KEYS.detail(id) });

      toast({
        title: 'משתמש נמחק בהצלחה',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה במחיקת משתמש',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
};

/**
 * הוק המשלב מספר פונקציות ניהול משתמשים
 */
export const useUserManagement = () => {
  const setUserAsAdmin = useUpdateUserRole();
  const setUserAsCoordinator = useUpdateUserRole();

  return {
    setUserAsAdmin: (id: string) => setUserAsAdmin.mutate({ id, role: 'admin' }),
    setUserAsCoordinator: (id: string) => setUserAsCoordinator.mutate({ id, role: 'coordinator' }),
    isSettingAdmin: setUserAsAdmin.isPending,
    isSettingCoordinator: setUserAsCoordinator.isPending,
  };
};
