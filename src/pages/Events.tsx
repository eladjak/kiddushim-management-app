
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { CreateEventForm } from "@/components/events/CreateEventForm";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventsList } from "@/components/events/EventsList";
import { CalendarInfoAccordion } from "@/components/events/CalendarInfoAccordion";
import { EmptyEventsState } from "@/components/events/EmptyEventsState";
import { EventsPageHeader } from "@/components/events/EventsPageHeader";
import { EventsLoadingState } from "@/components/events/EventsLoadingState";

const Events = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { profile } = useAuth();
  
  const isAdmin = profile?.role === "admin";
  const isCoordinator = profile?.role === "coordinator";
  const canCreateEvents = isAdmin || isCoordinator;
  
  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events_page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('main_time', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
  });
  
  const hasEvents = events.length > 0;
  const toggleCreateForm = () => setShowCreateForm(!showCreateForm);
  
  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col" dir="rtl">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <EventsPageHeader 
          canCreateEvents={canCreateEvents}
          showCreateForm={showCreateForm}
          onToggleCreateForm={toggleCreateForm}
        />
        
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
          <div className="space-y-8">
            <CalendarInfoAccordion />
            <EventsList events={events} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Events;
