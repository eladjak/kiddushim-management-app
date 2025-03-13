
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/layout/Footer";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatusBanner } from "@/components/dashboard/StatusBanner";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { useNotifications } from "@/hooks/dashboard/useNotifications";
import { useEvents } from "@/hooks/dashboard/useEvents";
import { useAssignments } from "@/hooks/dashboard/useAssignments";
import { logger } from "@/utils/logger";

export const Dashboard = () => {
  const { user, profile } = useAuth();
  const log = logger.createLogger({ component: 'Dashboard' });
  
  // Use the hooks for fetching data
  const { events, isLoading: eventsLoading } = useEvents();
  const { assignments, isLoading: assignmentsLoading } = useAssignments(user?.id);
  const { unreadCount: notificationsCount, isLoading: notificationsLoading } = useNotifications(user?.id);
  
  // Dashboard data state
  const [isAllDataLoaded, setIsAllDataLoaded] = useState(false);
  
  useEffect(() => {
    log.info("Dashboard loaded", { 
      userId: user?.id,
      role: profile?.role 
    });
    
    // Check if all data has loaded
    if (!eventsLoading && !assignmentsLoading && !notificationsLoading) {
      setIsAllDataLoaded(true);
    }
  }, [user, profile, eventsLoading, assignmentsLoading, notificationsLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 md:pt-24 pb-8 flex-grow">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            שלום {profile?.name || 'משתמש'}
          </h1>
          
          <StatusBanner isAllDataLoaded={isAllDataLoaded} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <UpcomingEvents 
                events={events} 
                isLoading={eventsLoading} 
              />
            </div>
            
            <div>
              <QuickActions 
                eventsCount={events?.length || 0}
                assignmentsCount={assignments?.length || 0}
                notificationsCount={notificationsCount || 0}
                isLoading={{
                  events: eventsLoading,
                  assignments: assignmentsLoading,
                  notifications: notificationsLoading
                }}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
