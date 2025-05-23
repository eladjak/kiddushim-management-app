
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProfileCreator } from "@/hooks/profile/useProfileCreator";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";
import { checkProfileExists } from "@/services/entity/users/profilesService";
import { containsNonLatinChars, safeEncode } from "@/utils/encoding";

export function useAutoProfileCreation() {
  const { user, profile, setProfile } = useAuth();
  const { createProfile } = useProfileCreator();
  const { toast } = useToast();
  const profileCreationAttemptedRef = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const log = logger.createLogger({ component: 'useAutoProfileCreation' });

  useEffect(() => {
    // Prevent multiple attempts during a single mounting cycle
    if (profileCreationAttemptedRef.current) return;
    
    const checkAndCreateProfile = async () => {
      // Only try to create a profile if we have a user but no profile
      if (user && !profile && retryCount < maxRetries) {
        log.info("Detected authenticated user without profile, creating one", { userId: user.id });
        profileCreationAttemptedRef.current = true;

        try {
          // First check if profile actually exists but wasn't fetched correctly
          const profileExists = await checkProfileExists(user.id).catch(() => false);
          
          if (profileExists) {
            log.info("Profile exists but wasn't fetched properly, refreshing page");
            // Force refresh to reload the profile
            setTimeout(() => {
              window.location.reload();
            }, 500);
            return;
          }
          
          // Check for Hebrew characters in user metadata before profile creation
          if (user.user_metadata) {
            for (const key in user.user_metadata) {
              if (typeof user.user_metadata[key] === 'string' && 
                  containsNonLatinChars(user.user_metadata[key] as string)) {
                log.info(`User has Hebrew characters in metadata field: ${key}`);
                // Our improved encoding functions will handle this appropriately
              }
            }
          }
          
          // Create profile if it doesn't exist
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
            log.error("Failed to auto-create profile, will retry");
            profileCreationAttemptedRef.current = false;
            setRetryCount(prev => prev + 1);
            
            if (retryCount >= maxRetries - 1) {
              toast({
                variant: "destructive",
                description: "לא ניתן היה ליצור פרופיל משתמש אוטומטית",
              });
            }
          }
        } catch (error) {
          log.error("Error in automatic profile creation:", error);
          profileCreationAttemptedRef.current = false;
          setRetryCount(prev => prev + 1);
          
          if (retryCount >= maxRetries - 1) {
            toast({
              variant: "destructive",
              description: "אירעה שגיאה בעת יצירת פרופיל משתמש",
            });
          }
        }
      }
    };

    // Use a slight delay to ensure auth state is fully initialized
    const timer = setTimeout(checkAndCreateProfile, 1000);
    return () => clearTimeout(timer);
  }, [user, profile, retryCount]);

  return { 
    profileCreationAttempted: profileCreationAttemptedRef.current,
    retryCount 
  };
}
