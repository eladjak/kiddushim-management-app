
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserProfileTabs } from "@/components/profile/UserProfileTabs";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LoadingScreen } from "@/components/dashboard/LoadingScreen";
import { logger } from "@/utils/logger";
import { usersService } from "@/services/entity/users";
import type { UserProfile as UserProfileType } from "@/types/profile";

/**
 * עמוד פרופיל המשתמש
 */
const UserProfile = () => {
  const { user, profile, isLoading } = useAuth();
  const { toast } = useToast();
  const log = logger.createLogger({ component: 'UserProfilePage' });
  const [isUpdating, setIsUpdating] = useState(false);

  // בדיקת נתוני משתמש בטעינה
  useEffect(() => {
    log.info("User profile page loaded", { isLoggedIn: !!user, hasProfile: !!profile });
  }, [user, profile]);

  // מוטציה לעדכון פרופיל משתמש
  const updateProfileMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<UserProfileType> }) => 
      usersService.updateProfile(userId, data),
    onSuccess: () => {
      toast({
        title: "הפרופיל עודכן בהצלחה",
        variant: "default",
      });
      setIsUpdating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בעדכון הפרופיל",
        description: error.message,
        variant: "destructive",
      });
      setIsUpdating(false);
    }
  });

  // פונקציית עדכון פרופיל
  const handleUpdateProfile = async (data: Partial<UserProfileType>) => {
    if (!user?.id) return;
    
    log.info("Updating profile", { userId: user.id, data });
    setIsUpdating(true);
    updateProfileMutation.mutate({ 
      userId: user.id, 
      data 
    });
  };

  // הצגת מסך טעינה אם אין נתונים עדיין
  if (isLoading || !user || !profile) {
    return <LoadingScreen />;
  }

  return (
    <div id="main-content" className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">פרופיל משתמש</h1>

      <UserProfileTabs
        profile={profile}
        userId={user.id}
        onSaveProfile={handleUpdateProfile}
        loading={isUpdating}
      />
    </div>
  );
};

export default UserProfile;
