
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen";
import { StatusBanner } from "@/components/dashboard/StatusBanner";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { useEvents } from "@/hooks/dashboard/useEvents";
import { useAssignments } from "@/hooks/dashboard/useAssignments";
import { useNotifications } from "@/hooks/dashboard/useNotifications";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { logger } from "@/utils/logger";
import { useEffect } from "react";

/**
 * Home page component showing dashboard data for authenticated users
 * or welcome screen for unauthenticated users
 */
const Index = () => {
  const { user } = useAuth();
  const log = logger.createLogger({ component: 'IndexPage' });

  // Fetch data for authenticated users
  const { data: events, isLoading: eventsLoading } = useEvents(user?.id);
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
    
    // Add extra logging to check the rendering
    console.log('Index page rendering', {
      user: user ? 'Authenticated' : 'Not authenticated',
      rendering: 'In progress'
    });
  }, [user, eventsLoading, assignmentsLoading, notificationsLoading]);

  // Render welcome screen for unauthenticated users
  if (!user) {
    console.log('Rendering welcome screen for unauthenticated user');
    return (
      <div className="min-h-screen bg-secondary/5 flex flex-col items-center justify-center p-4">
        <div className="mb-8">
          <Image 
            src="/kidushishi-logo.png" 
            alt="קידושישי" 
            className="h-40 mx-auto" 
            fallback="/placeholder.svg" 
          />
        </div>
        <WelcomeScreen />
        
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link to="/documentation" className="flex items-center gap-2">
              <FileText className="h-4 w-4 ml-1" />
              לתיעוד הפרויקט
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  console.log('Rendering dashboard for authenticated user');
  const isAllDataLoaded = !eventsLoading && !assignmentsLoading && !notificationsLoading;

  return (
    <div className="min-h-screen bg-secondary/30" dir="rtl">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <StatusBanner isAllDataLoaded={isAllDataLoaded} />

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
    </div>
  );
};

export default Index;
