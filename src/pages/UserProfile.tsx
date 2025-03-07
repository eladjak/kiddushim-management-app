
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/layout/Footer";
import { UserProfileTabs } from "@/components/profile/UserProfileTabs";

const UserProfile = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const onSaveProfile = async (values: any) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Create safe-to-store versions of the values to prevent encoding issues
      const safeValues = {
        name: values.name,
        phone: values.phone,
        language: values.language,
        shabbat_mode: values.shabbat_mode,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from("profiles")
        .update(safeValues)
        .eq("id", user.id);

      if (error) throw error;
      
      toast({
        description: "הפרופיל עודכן בהצלחה",
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        description: `שגיאה בעדכון הפרופיל: ${error.message}`,
      });
    } finally {
      setLoading(false);
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
            loading={loading}
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
