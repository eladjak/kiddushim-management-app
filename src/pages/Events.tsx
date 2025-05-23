
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
import { EventLocationMap } from "@/components/events/EventLocationMap";
import { useEvents } from "@/services/query/hooks/useEvents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarRange, MapPin } from "lucide-react";

const Events = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("list");
  const { profile } = useAuth();
  
  const isAdmin = profile?.role === "admin";
  const isCoordinator = profile?.role === "coordinator";
  const canCreateEvents = isAdmin || isCoordinator;
  
  // Fetch events using our updated hook
  const { data: events = [], isLoading } = useEvents();
  
  const hasEvents = events.length > 0;
  const toggleCreateForm = () => setShowCreateForm(!showCreateForm);
  
  const handleSelectEventOnMap = (eventId: string) => {
    // Scroll to the event in the list view or navigate to event details
    setActiveTab("list");
    setTimeout(() => {
      const element = document.getElementById(`event-${eventId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-event');
        setTimeout(() => element.classList.remove('highlight-event'), 3000);
      }
    }, 150);
  };
  
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
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
                  <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
                    <TabsTrigger value="list" className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4" />
                      <span>רשימת אירועים</span>
                    </TabsTrigger>
                    <TabsTrigger value="map" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>מפת אירועים</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="list" className="mt-4">
                    <EventsList events={events} />
                  </TabsContent>
                  
                  <TabsContent value="map" className="mt-4">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-xl font-semibold mb-4 pb-2 border-b">מפת אירועים</h2>
                      <EventLocationMap 
                        events={events} 
                        onSelectEvent={handleSelectEventOnMap} 
                      />
                      <p className="text-sm text-gray-500 mt-3 text-center">
                        לחץ על סמן כדי לראות פרטים נוספים על האירוע
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
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
