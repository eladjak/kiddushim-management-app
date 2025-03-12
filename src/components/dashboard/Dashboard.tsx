
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/layout/Footer";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatusBanner } from "@/components/dashboard/StatusBanner";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { logger } from "@/utils/logger";

// Define the props types for the components to fix TypeScript errors
interface DashboardDataState {
  isLoading: {
    events: boolean;
    assignments: boolean;
    notifications: boolean;
  };
  events: any[] | null;
  eventsCount: number | null;
  assignmentsCount: number | null;
  notificationsCount: number | null;
  isAllDataLoaded: boolean;
}

export const Dashboard = () => {
  const { user, profile } = useAuth();
  const log = logger.createLogger({ component: 'Dashboard' });
  
  // Add state for dashboard data with proper types
  const [dashboardData, setDashboardData] = useState<DashboardDataState>({
    isLoading: {
      events: true,
      assignments: true,
      notifications: true
    },
    events: null,
    eventsCount: null,
    assignmentsCount: null,
    notificationsCount: null,
    isAllDataLoaded: false
  });
  
  useEffect(() => {
    log.info("Dashboard loaded", { 
      userId: user?.id,
      role: profile?.role 
    });
    
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // In a real app, you would fetch actual data here
        // This is just a placeholder for demonstration
        setTimeout(() => {
          setDashboardData({
            isLoading: {
              events: false,
              assignments: false,
              notifications: false
            },
            events: [],
            eventsCount: 0,
            assignmentsCount: 0,
            notificationsCount: 0,
            isAllDataLoaded: true
          });
        }, 1000);
      } catch (error) {
        log.error("Error loading dashboard data", { error });
      }
    };
    
    loadDashboardData();
  }, [user, profile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 md:pt-24 pb-8 flex-grow">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            שלום {profile?.name || 'משתמש'}
          </h1>
          
          <StatusBanner isAllDataLoaded={dashboardData.isAllDataLoaded} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <UpcomingEvents 
                events={dashboardData.events} 
                isLoading={dashboardData.isLoading.events} 
              />
            </div>
            
            <div>
              <QuickActions 
                eventsCount={dashboardData.eventsCount}
                assignmentsCount={dashboardData.assignmentsCount}
                notificationsCount={dashboardData.notificationsCount}
                isLoading={dashboardData.isLoading}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
