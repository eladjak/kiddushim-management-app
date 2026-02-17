
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, Shield } from "lucide-react";
import { ProfileTab } from "./tabs/ProfileTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { AdminTab } from "./tabs/AdminTab";
import { UserProfile } from "@/types/profile";

interface UserProfileTabsProps {
  profile: UserProfile;
  loading: boolean;
  onSaveProfile: (values: Record<string, unknown>) => Promise<void>;
  userId?: string; // Making userId optional
}

export const UserProfileTabs = ({ profile, userId, loading, onSaveProfile }: UserProfileTabsProps) => {
  const isAdmin = profile?.role === "admin";

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          פרטים אישיים
        </TabsTrigger>
        
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          הגדרות
        </TabsTrigger>
        
        {isAdmin && (
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            ניהול משתמשים
          </TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="profile">
        <ProfileTab 
          profile={profile} 
          loading={loading} 
          onSaveProfile={onSaveProfile} 
        />
      </TabsContent>
      
      <TabsContent value="settings">
        <SettingsTab 
          profile={profile} 
          loading={loading} 
          onSaveProfile={onSaveProfile} 
        />
      </TabsContent>
      
      {isAdmin && (
        <TabsContent value="admin">
          <AdminTab userId={userId || profile.id} />
        </TabsContent>
      )}
    </Tabs>
  );
};
