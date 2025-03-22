
import { useAuth } from "@/context/AuthContext";
import { QuickActions } from "./QuickActions";
import { UpcomingEvents } from "./UpcomingEvents";
import { StatusBanner } from "./StatusBanner";
import { SecurityBanner } from "./SecurityBanner";
import { useProfile } from "@/hooks/useProfile";

export const Dashboard = () => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const isCoordinator = profile?.role === "coordinator";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-primary">
        {profile?.name ? `שלום, ${profile.name}` : "ברוכים הבאים"}
      </h1>
      
      {/* Security Banner - will show only for admins and coordinators */}
      {(isAdmin || isCoordinator) && <SecurityBanner />}
      
      {/* Status Banner - only for admins */}
      {isAdmin && <StatusBanner />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingEvents />
        </div>
        
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};
