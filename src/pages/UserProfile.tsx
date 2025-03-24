
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/Footer";
import { UserProfileTabs } from "@/components/profile/UserProfileTabs";
import { useUpdateUserProfile } from "@/services/query/hooks/useUsers";

// טיפוס עבור ערכי הפרופיל שניתן לעדכן
interface ProfileValues {
  name?: string;
  phone?: string;
  language?: string;
  shabbat_mode?: boolean;
}

/**
 * דף פרופיל המשתמש
 * מאפשר צפייה ועריכה של פרטי המשתמש
 */
const UserProfile = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const updateProfile = useUpdateUserProfile();
  
  /**
   * שמירת פרטי פרופיל משתמש
   */
  const onSaveProfile = async (values: ProfileValues) => {
    if (!user?.id) return;
    
    try {
      // עדכון פרטי הפרופיל באמצעות הוק React Query
      await updateProfile.mutateAsync({
        userId: user.id,
        data: {
          ...values,
          updated_at: new Date().toISOString(),
        }
      });
      
      toast({
        description: "הפרופיל עודכן בהצלחה",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      // הטיפול בשגיאות מתבצע בהוק useUpdateUserProfile
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col" dir="rtl">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <h1 className="text-3xl font-bold mb-6 text-right">פרופיל משתמש</h1>
        
        {user && profile ? (
          <UserProfileTabs 
            profile={profile} 
            userId={user.id}
            loading={updateProfile.isPending}
            onSaveProfile={onSaveProfile}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-lg">יש להתחבר כדי לצפות בפרופיל</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfile;
