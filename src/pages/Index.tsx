
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

const Index = () => {
  const { user } = useAuth();

  const { data: events, isLoading: eventsLoading } = useEvents(user?.id);
  const { data: assignments, isLoading: assignmentsLoading } = useAssignments(user?.id);
  const { data: notifications, isLoading: notificationsLoading } = useNotifications(user?.id);

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary/5 flex flex-col items-center justify-center p-4">
        <div className="mb-8">
          <img src="/kidushishi-logo.png" alt="קידושישי" className="h-40 mx-auto" />
        </div>
        <WelcomeScreen />
      </div>
    );
  }

  const isAllDataLoaded = !eventsLoading && !assignmentsLoading && !notificationsLoading;

  return (
    <div className="min-h-screen bg-secondary/30">
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
