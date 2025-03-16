
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/layout/Footer";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatusBanner } from "@/components/dashboard/StatusBanner";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { useNotifications } from "@/hooks/dashboard/useNotifications";
import { useEvents } from "@/hooks/dashboard/useEvents";
import { useAssignments } from "@/hooks/dashboard/useAssignments";
import { logger } from "@/utils/logger";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

export const Dashboard = () => {
  const { user, profile } = useAuth();
  const log = logger.createLogger({ component: 'Dashboard' });
  const isMobile = useIsMobile();
  
  // Use the hooks for fetching data
  const { data: eventsData, isLoading: eventsLoading } = useEvents(user?.id);
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignments(user?.id);
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
      <main className="container mx-auto px-4 pt-20 pb-8 flex-grow">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">
            שלום {profile?.name || 'משתמש'}
          </h1>
          
          <StatusBanner isAllDataLoaded={isAllDataLoaded} />
          
          {isMobile ? (
            // Mobile layout
            <div className="space-y-4 mt-4">
              <QuickActions 
                eventsCount={eventsData?.length || 0}
                assignmentsCount={assignmentsData?.length || 0}
                notificationsCount={notificationsCount || 0}
                isLoading={{
                  events: eventsLoading,
                  assignments: assignmentsLoading,
                  notifications: notificationsLoading
                }}
              />
              
              <Separator className="my-4" />
              
              <UpcomingEvents 
                events={eventsData || []} 
                isLoading={eventsLoading} 
              />
            </div>
          ) : (
            // Desktop layout
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2">
                <UpcomingEvents 
                  events={eventsData || []} 
                  isLoading={eventsLoading} 
                />
              </div>
              
              <div>
                <QuickActions 
                  eventsCount={eventsData?.length || 0}
                  assignmentsCount={assignmentsData?.length || 0}
                  notificationsCount={notificationsCount || 0}
                  isLoading={{
                    events: eventsLoading,
                    assignments: assignmentsLoading,
                    notifications: notificationsLoading
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
