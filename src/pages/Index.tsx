
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";
import { StatusBanner } from "@/components/dashboard/StatusBanner";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { useEvents } from "@/hooks/dashboard/useEvents";
import { useAssignments } from "@/hooks/dashboard/useAssignments";
import { useNotifications } from "@/hooks/dashboard/useNotifications";
import { logger } from "@/utils/logger";
import { useEffect } from "react";
import { Image } from "@/components/ui/image";
import { Footer } from "@/components/layout/Footer";

/**
 * Home page component showing dashboard data for authenticated users
 * or welcome screen for unauthenticated users
 */
const Index = () => {
  const { user, profile } = useAuth();
  const log = logger.createLogger({ component: 'IndexPage' });

  // Fetch data for authenticated users
  const { data: events = [], isLoading: eventsLoading } = useEvents(user?.id);
  const { data: assignments, isLoading: assignmentsLoading } = useAssignments(user?.id);
  const { data: notifications, isLoading: notificationsLoading } = useNotifications(user?.id);

  // Log data loading status
  useEffect(() => {
    log.info('Index page loaded', { 
      authenticated: !!user,
      dataLoading: {
        events: eventsLoading,
        assignments: assignmentsLoading,
        notifications: notificationsLoading
      }
    });
    
    console.log('Index page rendering', {
      user: user ? 'Authenticated' : 'Not authenticated',
      rendering: 'In progress'
    });
  }, [user, eventsLoading, assignmentsLoading, notificationsLoading]);

  // Render welcome screen for unauthenticated users
  if (!user) {
    console.log('Rendering welcome screen for unauthenticated user');
    return <WelcomeScreen />;
  }

  console.log('Rendering dashboard for authenticated user');
  const isAllDataLoaded = !eventsLoading && !assignmentsLoading && !notificationsLoading;

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col" dir="rtl">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-16 md:pt-24 pb-8 md:pb-12 flex-grow">
        <div className="flex justify-center mb-6 md:mb-8">
          <Image 
            src="/lovable-uploads/95344b3f-5084-447f-8d10-aa4f56fbb8f1.png" 
            alt="קידושישי" 
            className="h-20 md:h-24 w-auto" 
            fallback="/placeholder.svg"
          />
        </div>
        
        <StatusBanner isAllDataLoaded={isAllDataLoaded} />

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 text-right">שלום, {profile?.name || "משתמש יקר"}</h1>
          <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">ברוכים הבאים למערכת ניהול האירועים והמתנדבים של קידושישי</p>
        </div>

        <QuickActions
          eventsCount={events?.length}
          assignmentsCount={assignments?.length}
          notificationsCount={notifications?.length}
          isLoading={{
            events: eventsLoading,
            assignments: assignmentsLoading,
            notifications: notificationsLoading,
          }}
        />

        <UpcomingEvents
          events={events}
          isLoading={eventsLoading}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
