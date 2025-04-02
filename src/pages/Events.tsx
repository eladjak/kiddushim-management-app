
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { CreateEventForm } from "@/components/events/CreateEventForm";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/layout/Footer";
import { CalendarInfoAccordion } from "@/components/events/CalendarInfoAccordion";
import { EmptyEventsState } from "@/components/events/EmptyEventsState";
import { EventsPageHeader } from "@/components/events/EventsPageHeader";
import { EventsLoadingState } from "@/components/events/EventsLoadingState";
import { EventsList } from "@/components/events/EventsList";
import { useEvents } from "@/services/query/hooks/useEvents";

const Events = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { profile } = useAuth();
  
  const isAdmin = profile?.role === "admin";
  const isCoordinator = profile?.role === "coordinator";
  const canCreateEvents = isAdmin || isCoordinator;
  
  // Fetch events using our updated hook
  const { data: events = [], isLoading } = useEvents();
  
  const hasEvents = events.length > 0;
  const toggleCreateForm = () => setShowCreateForm(!showCreateForm);
  
  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col" dir="rtl">
      <Navigation />
      <main className="container mx-auto px-4 py-20 flex-grow">
        <div className="max-w-5xl mx-auto">
          <EventsPageHeader 
            canCreateEvents={canCreateEvents}
            showCreateForm={showCreateForm}
            onToggleCreateForm={toggleCreateForm}
          />
          
          <div className="space-y-6">
            {showCreateForm ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <CreateEventForm />
              </div>
            ) : isLoading ? (
              <EventsLoadingState />
            ) : !hasEvents ? (
              <EmptyEventsState 
                canCreateEvents={canCreateEvents} 
                onCreateEvent={() => setShowCreateForm(true)} 
              />
            ) : (
              <>
                <CalendarInfoAccordion />
                <EventsList events={events} />
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
