
import { useAuth } from "@/context/AuthContext";
import { QuickActions } from "./QuickActions";
import { UpcomingEvents } from "./UpcomingEvents";
import { StatusBanner } from "./StatusBanner";
import { SecurityBanner } from "./SecurityBanner";
import { useEvents } from "@/hooks/dashboard/useEvents";
import { useAssignments } from "@/hooks/dashboard/useAssignments";
import { useNotifications } from "@/hooks/dashboard/useNotifications";

export const Dashboard = () => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const isCoordinator = profile?.role === "coordinator";
  
  // Fetch events data
  const { 
    data: eventsData, 
    isLoading: eventsLoading 
  } = useEvents(user?.id);
  
  // Fetch assignments data
  const { 
    data: assignmentsData, 
    isLoading: assignmentsLoading 
  } = useAssignments(user?.id);
  
  // Fetch notifications data
  const { 
    notifications, 
    unreadCount: notificationsCount,
    isLoading: notificationsLoading 
  } = useNotifications(user?.id);
  
  // Check if all data has loaded for admin dashboard
  const isAllDataLoaded = !eventsLoading && !assignmentsLoading && !notificationsLoading;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-primary">
        {profile?.name ? `שלום, ${profile.name}` : "ברוכים הבאים"}
      </h1>
      
      {/* Security Banner - will show only for admins and coordinators */}
      {(isAdmin || isCoordinator) && <SecurityBanner />}
      
      {/* Status Banner - only for admins */}
      {isAdmin && <StatusBanner isAllDataLoaded={isAllDataLoaded} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingEvents 
            events={eventsData} 
            isLoading={eventsLoading} 
          />
        </div>
        
        <div className="lg:col-span-1">
          <QuickActions 
            eventsCount={eventsData?.length ?? 0}
            assignmentsCount={assignmentsData?.length ?? 0}
            notificationsCount={notificationsCount ?? 0}
            isLoading={{
              events: eventsLoading,
              assignments: assignmentsLoading,
              notifications: notificationsLoading
            }}
          />
        </div>
      </div>
    </div>
  );
};
