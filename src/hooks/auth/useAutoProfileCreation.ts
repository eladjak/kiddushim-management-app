
import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProfileCreator } from "@/hooks/profile/useProfileCreator";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";

export function useAutoProfileCreation() {
  const { user, profile, setProfile } = useAuth();
  const { createProfile } = useProfileCreator();
  const { toast } = useToast();
  const profileCreationAttemptedRef = useRef(false);
  const log = logger.createLogger({ component: 'useAutoProfileCreation' });

  useEffect(() => {
    const checkAndCreateProfile = async () => {
      // Only try to create a profile if we have a user but no profile,
      // and haven't already attempted creation
      if (user && !profile && !profileCreationAttemptedRef.current) {
        log.info("Detected authenticated user without profile, creating one", { userId: user.id });
        profileCreationAttemptedRef.current = true;

        try {
          const createdProfile = await createProfile(user.id, user);
          
          if (createdProfile) {
            log.info("Profile automatically created", { profileId: createdProfile.id });
            
            // Update profile in auth context
            if (typeof setProfile === 'function') {
              setProfile(createdProfile);
            }
            
            toast({
              description: "הפרופיל נוצר בהצלחה",
            });
          } else {
            log.error("Failed to auto-create profile");
            
            toast({
              variant: "destructive",
              description: "לא ניתן היה ליצור פרופיל משתמש אוטומטית",
            });
          }
        } catch (error) {
          log.error("Error in automatic profile creation:", error);
          
          toast({
            variant: "destructive",
            description: "אירעה שגיאה בעת יצירת פרופיל משתמש",
          });
        }
      }
    };

    checkAndCreateProfile();
  }, [user, profile]);

  return { profileCreationAttempted: profileCreationAttemptedRef.current };
}
